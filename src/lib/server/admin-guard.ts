import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_ROLES = ["super_admin", "head_rg"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

type GuardOk = { ok: true; admin: SupabaseClient; callerId: string; callerRole: AdminRole };
type GuardFail = { ok: false; response: NextResponse };

/**
 * Server-only. Confirms the caller is signed in and is Super Admin or Head of
 * Revenue Growth, and returns a service-role client. Fails closed: if any key
 * is missing or the role can't be read, the request is refused.
 */
export async function requireAdmin(): Promise<GuardOk | GuardFail> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY (and the public Supabase URL/key) must be set on the server to manage users." },
        { status: 501 }
      ),
    };
  }

  try {
    const cookieStore = cookies();
    const serverClient = createServerClient(url, anonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set() {},
        remove() {},
      },
    });
    const {
      data: { user },
    } = await serverClient.auth.getUser();
    if (!user) {
      return { ok: false, response: NextResponse.json({ error: "Unauthorized: not signed in." }, { status: 401 }) };
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: profile } = await admin.from("profiles").select("role, is_active").eq("id", user.id).single();
    if (!profile || !profile.is_active || !(ADMIN_ROLES as readonly string[]).includes(profile.role)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Forbidden: only Super Admin or Head of Revenue Growth can manage users." },
          { status: 403 }
        ),
      };
    }
    return { ok: true, admin, callerId: user.id, callerRole: profile.role as AdminRole };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized: could not verify role." }, { status: 401 }) };
  }
}

/** Supabase stores bcrypt hashes: 8 to 72 bytes. */
export function passwordProblem(pw: unknown): string | null {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters.";
  if (new TextEncoder().encode(pw).length > 72) return "Password is too long (max 72 bytes).";
  if (pw.trim() !== pw) return "Password can't start or end with a space.";
  return null;
}
