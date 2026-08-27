import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not configured on the server. Invite users manually via the Supabase Dashboard, or add this env variable and redeploy.",
      },
      { status: 501 }
    );
  }

  // ── Auth Guard: verify the caller is super_admin or head_rg ──────────────
  if (url && anonKey) {
    try {
      const cookieStore = cookies();
      const serverClient = createServerClient(url, anonKey, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      });
      const {
        data: { user },
      } = await serverClient.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized: not authenticated." }, { status: 401 });
      }

      // Check role from profiles table using admin client (bypasses RLS)
      const admin = createClient(url, serviceKey);
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const allowedRoles = ["super_admin", "head_rg"];
      if (!profile || !allowedRoles.includes(profile.role)) {
        return NextResponse.json(
          { error: "Forbidden: only Super Admin or Head of Revenue Growth can invite users." },
          { status: 403 }
        );
      }
    } catch {
      // If role check fails, block to be safe
      return NextResponse.json({ error: "Unauthorized: could not verify role." }, { status: 401 });
    }
  }

  const { email, full_name, role, division } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const admin = createClient(url, serviceKey);

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role, division },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user) {
    await admin.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: full_name ?? email,
      role: role ?? "team_rg",
      division: division ?? null,
      is_active: true,
    });
  }

  return NextResponse.json({ ok: true });
}
