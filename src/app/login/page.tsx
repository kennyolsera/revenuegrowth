"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Field, Label } from "@/components/ui/Input";
import { AlertTriangle, Lock, Mail, TrendingUp, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, language, setLanguage } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(params.get("redirectTo") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen bg-slate-950">
      {/* Language Switcher on Top Right Corner of Login Screen */}
      <div className="absolute right-6 top-6 z-40">
        <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 p-1 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLanguage("id")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              language === "id"
                ? "bg-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <span>🇮🇩</span>
            <span className="font-mono">ID</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              language === "en"
                ? "bg-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <span>🇬🇧</span>
            <span className="font-mono">EN</span>
          </button>
        </div>
      </div>

      {/* Left Panel — Console rail */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-rail p-12 text-white lg:flex border-r border-rail-line">
        <div className="relative z-10">
          <Logo tone="light" size={36} />
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="label-mono inline-flex items-center gap-2 border-l-2 border-accent-bright pl-3 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-bright" /> Enterprise Operations Suite
          </div>

          <h1 className="font-display text-[32px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[38px]">
            {language === "id" ? "Akselerasi Pertumbuhan Layanan Value-Added" : "Accelerate Growth for Value-Added Services"}
          </h1>

          <p className="text-sm leading-relaxed text-slate-400">{t("login_hero_desc")}</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-md border border-rail-line bg-rail-soft p-3.5">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-200">
                <TrendingUp className="h-4 w-4 text-accent-bright" /> 12 Modules
              </div>
              <p className="label-mono mt-1.5 text-slate-500">Integrated Pipeline</p>
            </div>
            <div className="rounded-md border border-rail-line bg-rail-soft p-3.5">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-200">
                <ShieldCheck className="h-4 w-4 text-accent-bright" /> Role-based
              </div>
              <p className="label-mono mt-1.5 text-slate-500">Access Control</p>
            </div>
          </div>
        </div>

        <div className="label-mono relative z-10 flex items-center justify-between text-slate-500">
          <span>© {new Date().getFullYear()} Revenue Growth · VAS</span>
          <span>v1.0</span>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="relative flex w-full items-center justify-center bg-surface p-6 lg:flex-1">
        <div className="relative w-full max-w-md space-y-6">
          <div className="lg:hidden">
            <Logo tone="dark" size={38} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t("login_form_title")}</h2>
            <p className="text-xs sm:text-sm text-slate-500">{t("login_form_desc")}</p>
          </div>

          {!isSupabaseConfigured && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{t("login_supabase_warn")}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <Label htmlFor="email">{t("login_email")}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="kenny@perusahaan.com"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Field>

            <Field>
              <Label htmlFor="password">{t("login_password")}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </Field>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-status-danger">
                {error}
              </div>
            )}

            <Button type="submit" variant="accent" loading={loading} className="w-full h-11 text-sm font-semibold shadow-md shadow-accent/25">
              {t("login_submit")}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            {t("login_need_account")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
