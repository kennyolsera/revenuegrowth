import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/safe-next";

const OTP_TYPES: EmailOtpType[] = ["recovery", "invite", "signup", "magiclink", "email", "email_change"];

/**
 * Turns an emailed auth link (password reset or invite) into a cookie session,
 * then redirects to `next`. See ADR-002.
 *
 *  - `?token_hash=…&type=recovery|invite` — from edited email templates; works on any device.
 *  - `?code=…` — PKCE link from the default templates; works in the browser that asked for it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = createServerSupabaseClient();
  let ok = false;

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/login?error=link_invalid", origin));
  }
  return NextResponse.redirect(new URL(next, origin));
}
