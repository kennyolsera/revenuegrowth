"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Field, Label } from "@/components/ui/Input";
import { Warning as AlertTriangle, Lock, Envelope as Mail } from "@phosphor-icons/react";
import { AuthShell, AuthNotice } from "@/components/auth/AuthShell";
import { useLanguage } from "@/lib/LanguageContext";
import { safeNext } from "@/lib/auth/safe-next";

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkInvalid = params.get("error") === "link_invalid";

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
    // Only same-site paths: a crafted ?redirectTo= must not send users off-site after sign-in.
    router.push(safeNext(params.get("redirectTo")));
    router.refresh();
  }

  return (
    <AuthShell
      title={t("login_form_title")}
      description={t("login_form_desc")}
      below={t("login_need_account")}
    >
      {!isSupabaseConfigured && (
        <AuthNotice icon={<AlertTriangle className="h-[14px] w-[14px]" />}>{t("login_supabase_warn")}</AuthNotice>
      )}
      {linkInvalid && (
        <AuthNotice tone="error" icon={<AlertTriangle className="h-[14px] w-[14px]" />}>
          {t("login_link_invalid")}{" "}
          <Link href="/forgot-password" className="font-medium text-text underline underline-offset-2">
            {t("auth_request_new_link")}
          </Link>
        </AuthNotice>
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
          <div className="mb-1.5 flex items-baseline justify-between">
            <Label htmlFor="password" className="mb-0">{t("login_password")}</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-accent hover:text-accent-strong">
              {t("auth_forgot_link")}
            </Link>
          </div>
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
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
