import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";

/**
 * Permanently delete a member's login and profile (profile cascades from
 * auth.users). Requests and claims they submitted stay, with "submitted by"
 * cleared; their notifications are removed.
 * Rules: you can't delete yourself; Head RG can't delete a Super Admin.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { admin, callerId, callerRole } = guard;

  const body = await request.json().catch(() => ({}));
  const userId = String(body.user_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return NextResponse.json({ error: "Unknown user." }, { status: 400 });
  if (userId === callerId) return NextResponse.json({ error: "You can't delete your own account." }, { status: 403 });

  const { data: target } = await admin.from("profiles").select("role").eq("id", userId).single();
  if (target?.role === "super_admin" && callerRole !== "super_admin") {
    return NextResponse.json({ error: "Only a Super Admin can delete a Super Admin." }, { status: 403 });
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error && !/not found/i.test(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // A profile without a login (or a login already gone) is removed directly.
  await admin.from("profiles").delete().eq("id", userId);

  return NextResponse.json({ ok: true });
}
