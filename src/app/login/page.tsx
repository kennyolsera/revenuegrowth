"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Field, Label } from "@/components/ui/Input";
import {
  AlertTriangle,
  Lock,
  Mail,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
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

      {/* Left Panel — Premium Visual Graphic Hero */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex border-r border-slate-800/60">
        {/* Layered background graphics */}
        <div className="pointer-events-none absolute inset-0 bg-mesh-dark" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.15]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent-violet/20 blur-3xl animate-float" />

        <div className="relative z-10">
          <Logo tone="light" size={44} />
        </div>

        <div className="relative z-10 my-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" /> Enterprise Operations Suite
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            {language === "id" ? (
              <>
                Akselerasi Pertumbuhan <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  Layanan Value-Added
                </span>
              </>
            ) : (
              <>
                Accelerate Growth for <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  Value-Added Services
                </span>
              </>
            )}
          </h1>

          <p className="max-w-md text-sm text-slate-300/80 leading-relaxed">
            {t("login_hero_desc")}
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-2 max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <TrendingUp className="h-4 w-4" /> +22.8% YTD
              </div>
              <p className="mt-1 text-xs text-slate-400">Financing Growth</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <ShieldCheck className="h-4 w-4" /> 12 Modules
              </div>
              <p className="mt-1 text-xs text-slate-400">Integrated Pipeline</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Revenue Growth (VAS)</span>
          <span className="font-mono">v1.0 Production</span>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="relative flex w-full items-center justify-center bg-surface-canvas p-6 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-aurora" />
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
