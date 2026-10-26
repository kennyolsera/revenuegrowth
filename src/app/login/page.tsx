"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Field, Label } from "@/components/ui/Input";
import { AlertTriangle, Lock, Mail } from "lucide-react";
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
    <div className="relative flex min-h-screen flex-col bg-bg">
      {/* Language switch, top right */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-5">
        <div role="radiogroup" aria-label="Language" className="inline-flex rounded-md bg-surface-3 p-0.5">
          {(["id", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={language === lang}
              onClick={() => setLanguage(lang)}
              title={lang === "id" ? "Bahasa Indonesia" : "English"}
              className={cn(
                "inline-flex h-6 items-center rounded-xs px-2 text-xs font-medium uppercase transition-colors",
                language === lang ? "bg-surface text-text shadow-sm" : "text-text-3 hover:text-text"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Centred auth box (DESIGN.md: only auth, empty and full-page states are centred) */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[380px] animate-fade-up">
          <Logo tone="dark" size={28} />

          <div className="mt-8">
            <h1 className="text-xl text-text">{t("login_form_title")}</h1>
            <p className="mt-1 text-[12.5px] text-text-3">{t("login_form_desc")}</p>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface p-5">
            {!isSupabaseConfigured && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-border bg-surface-2 p-3 text-xs text-text-2">
                <AlertTriangle className="mt-px h-[14px] w-[14px] shrink-0 text-amber" />
                <span>{t("login_supabase_warn")}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field>
                <Label htmlFor="email">{t("login_email")}</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-text-4" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="nama@perusahaan.com"
                    className="h-9 pl-8"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </Field>

              <Field>
                <Label htmlFor="password">{t("login_password")}</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-text-4" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="h-9 pl-8"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </Field>

              {error && (
                <p role="alert" className="flex items-start gap-1.5 text-xs text-red">
                  <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}

              <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
                {t("login_submit")}
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-text-3">{t("login_need_account")}</p>
        </div>
      </main>

      <footer className="flex items-center justify-between px-4 pb-4 text-xs text-text-4 sm:px-6">
        <span>© {new Date().getFullYear()} Revenue Growth · VAS</span>
        <span>v1.0</span>
      </footer>
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
