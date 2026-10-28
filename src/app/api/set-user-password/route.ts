import { NextResponse, type NextRequest } from "next/server";
import { passwordProblem, requireAdmin } from "@/lib/server/admin-guard";

/**
 * Admin sets a new password for an existing member (no email link needed).
 * Also confirms the email, so people stuck on an unaccepted invite can sign in.
 * A Head of Revenue Growth cannot change a Super Admin's password.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { admin, callerRole } = guard;

  const body = await request.json().catch(() => ({}));
  const userId = String(body.user_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    return NextResponse.json({ error: "Unknown user." }, { status: 400 });
  }
  const problem = passwordProblem(body.password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const { data: target } = await admin.from("profiles").select("role").eq("id", userId).single();
  if (!target) return NextResponse.json({ error: "Unknown user." }, { status: 404 });
  if (target.role === "super_admin" && callerRole !== "super_admin") {
    return NextResponse.json({ error: "Only a Super Admin can change a Super Admin's password." }, { status: 403 });
  }

  const { error } = await admin.auth.admin.updateUserById(userId, { password: body.password, email_confirm: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
