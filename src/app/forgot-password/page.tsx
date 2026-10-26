"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Mail, MailCheck } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Field, Label } from "@/components/ui/Input";
import { AuthShell, AuthNotice } from "@/components/auth/AuthShell";
import { useLanguage } from "@/lib/LanguageContext";

const RESEND_COOLDOWN_S = 60;

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function send(address: string) {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent("/reset-password")}`;
    const { error } = await supabase.auth.resetPasswordForEmail(address.trim(), { redirectTo });
    setLoading(false);

    if (error) {
      // Never reveal whether the email exists: only rate limits and outages are surfaced.
      setError(error.status === 429 ? t("auth_forgot_rate_limited") : t("auth_generic_error"));
      return;
    }
    setSentTo(address.trim());
    setCooldown(RESEND_COOLDOWN_S);
  }

  const back = (
    <Link href="/login" className="inline-flex items-center gap-1 font-medium text-text-2 hover:text-text">
      <ArrowLeft className="h-3.5 w-3.5" />
      {t("auth_back_to_login")}
    </Link>
  );

  if (sentTo) {
    return (
      <AuthShell title={t("auth_forgot_sent_title")} below={back}>
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-green" aria-hidden />
          <p className="text-sm text-text-2">{t("auth_forgot_sent_desc").replace("{email}", sentTo)}</p>
        </div>
        {error && <p role="alert" className="mt-3 text-xs text-red">{error}</p>}
        <Button
          type="button"
          variant="secondary"
          className="mt-5 w-full"
          loading={loading}
          disabled={cooldown > 0}
          onClick={() => send(sentTo)}
        >
          {cooldown > 0 ? t("auth_forgot_resend_in").replace("{s}", String(cooldown)) : t("auth_forgot_resend")}
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("auth_forgot_title")} description={t("auth_forgot_desc")} below={back}>
      {!isSupabaseConfigured && (
        <AuthNotice icon={<AlertTriangle className="h-[14px] w-[14px]" />}>{t("login_supabase_warn")}</AuthNotice>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(email);
        }}
        className="space-y-4"
      >
        <Field>
          <Label htmlFor="email">{t("login_email")}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-text-4" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              placeholder="nama@perusahaan.com"
              className="h-9 pl-8"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          {t("auth_forgot_submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
