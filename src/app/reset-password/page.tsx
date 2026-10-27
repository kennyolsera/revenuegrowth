"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Warning as AlertTriangle, Eye, EyeSlash as EyeOff, CircleNotch as Loader2, Lock } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Field, Label } from "@/components/ui/Input";
import { AuthShell } from "@/components/auth/AuthShell";
import { useLanguage } from "@/lib/LanguageContext";

const MIN_LENGTH = 8;

type LinkState = "checking" | "ready" | "invalid";

/**
 * Accepts the session created by /auth/confirm, or — for invite emails still on
 * Supabase's default template — tokens in the URL hash (implicit flow). See ADR-002.
 */
async function establishSession(): Promise<{ ok: boolean; isInvite: boolean }> {
  const supabase = createClient();
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const isInvite = hash.get("type") === "invite";

  if (hash.get("error") || hash.get("error_code")) {
    return { ok: false, isInvite };
  }

  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    // Remove tokens from the address bar and history either way.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    if (error) return { ok: false, isInvite };
  }

  const { data } = await supabase.auth.getUser();
  return { ok: !!data.user, isInvite };
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  autoFocus,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
  invalid?: boolean;
}) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-text-4" />
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
        minLength={MIN_LENGTH}
        aria-invalid={invalid || undefined}
        className="h-9 pl-8 pr-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("auth_hide_password") : t("auth_show_password")}
        title={visible ? t("auth_hide_password") : t("auth_show_password")}
        className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-3 hover:bg-surface-2 hover:text-text"
      >
        {visible ? <EyeOff className="h-[14px] w-[14px]" /> : <Eye className="h-[14px] w-[14px]" />}
      </button>
    </div>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();

  const [state, setState] = useState<LinkState>("checking");
  const [isInvite, setIsInvite] = useState(params.get("mode") === "invite");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    establishSession()
      .then(({ ok, isInvite: fromHash }) => {
        if (cancelled) return;
        if (fromHash) setIsInvite(true);
        setState(ok ? "ready" : "invalid");
      })
      .catch(() => !cancelled && setState("invalid"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (password.length < MIN_LENGTH) return setFieldError(t("auth_err_short"));
    if (password !== confirm) return setFieldError(t("auth_err_mismatch"));
    setFieldError(null);

    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (error) {
      // Supabase messages here are specific and safe to show (e.g. same as old password, too weak).
      setSubmitError(error.message);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  if (state === "checking") {
    return (
      <AuthShell title={isInvite ? t("auth_invite_title") : t("auth_reset_title")}>
        <p role="status" className="flex items-center gap-2 text-sm text-text-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("auth_checking_link")}
        </p>
      </AuthShell>
    );
  }

  if (state === "invalid") {
    return (
      <AuthShell
        title={t("auth_link_invalid_title")}
        description={t("auth_link_invalid_desc")}
        below={
          <Link href="/login" className="font-medium text-text-2 hover:text-text">
            {t("auth_back_to_login")}
          </Link>
        }
      >
        <Link
          href="/forgot-password"
          className="inline-flex h-9 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-on hover:bg-accent-strong"
        >
          {t("auth_request_new_link")}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={isInvite ? t("auth_invite_title") : t("auth_reset_title")}
      description={isInvite ? t("auth_invite_desc") : t("auth_reset_desc")}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field>
          <Label htmlFor="new-password">{t("auth_new_password")}</Label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={setPassword}
            invalid={!!fieldError && password.length < MIN_LENGTH}
          />
          {isInvite && <p className="mt-1 text-xs text-text-3">{t("auth_reset_desc")}</p>}
        </Field>
        <Field>
          <Label htmlFor="confirm-password">{t("auth_confirm_password")}</Label>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
            invalid={!!fieldError && password !== confirm}
          />
        </Field>

        {(fieldError || submitError) && (
          <p role="alert" className="flex items-start gap-1.5 text-xs text-red">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            {fieldError || submitError}
          </p>
        )}

        <Button type="submit" variant="accent" size="lg" loading={saving} className="w-full">
          {t("auth_reset_submit")}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
