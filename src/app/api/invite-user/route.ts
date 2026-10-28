import { NextResponse, type NextRequest } from "next/server";
import { passwordProblem, requireAdmin } from "@/lib/server/admin-guard";

const ROLES = ["super_admin", "head_rg", "team_rg", "external_team", "finance_ops"];

/**
 * Add a team member. Two modes:
 *  - "password" (default): the admin sets the password; the account is created
 *    already confirmed, so the person can sign in straight away. No email link.
 *  - "invite": Supabase emails a set-password link (ADR-002). Depends on the
 *    Supabase Site URL / Redirect URLs pointing at the live domain.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { admin, callerRole } = guard;

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const full_name = String(body.full_name ?? "").trim() || email;
  const role = ROLES.includes(body.role) ? body.role : "team_rg";
  const division = String(body.division ?? "").trim() || null;
  const mode = body.mode === "invite" ? "invite" : "password";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  // Only a Super Admin can create another Super Admin.
  if (role === "super_admin" && callerRole !== "super_admin") {
    return NextResponse.json({ error: "Only a Super Admin can add another Super Admin." }, { status: 403 });
  }

  const metadata = { full_name, role, division };
  let userId: string | undefined;

  if (mode === "password") {
    const problem = passwordProblem(body.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) {
      const exists = /already (been )?registered|already exists/i.test(error.message);
      return NextResponse.json(
        {
          error: exists
            ? "A user with this email already exists. Use \"Set password\" on their row instead."
            : error.message,
        },
        { status: exists ? 409 : 400 }
      );
    }
    userId = data.user?.id;
  } else {
    // Invite link lands on the set-password page. Supabase only honours redirect
    // URLs on its allowlist, so a spoofed Host header can't redirect elsewhere.
    const next = encodeURIComponent("/reset-password?mode=invite");
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: metadata,
      redirectTo: `${request.nextUrl.origin}/auth/confirm?next=${next}`,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    userId = data.user?.id;
  }

  if (userId) {
    await admin.from("profiles").upsert({ id: userId, email, full_name, role, division, is_active: true });
  }

  return NextResponse.json({ ok: true, mode });
}
