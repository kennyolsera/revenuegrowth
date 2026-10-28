import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";

const ROLES = ["super_admin", "head_rg", "team_rg", "external_team", "finance_ops"];
const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Edit a member: name, email, role, division, phone. Email changes go to
 * Supabase Auth too (confirmed immediately, no email link), so the login and the
 * profile stay in sync.
 * Rules: Head RG can't edit a Super Admin or grant Super Admin; nobody changes
 * their own role (avoids locking yourself out).
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { admin, callerId, callerRole } = guard;

  const body = await request.json().catch(() => ({}));
  const userId = String(body.user_id ?? "");
  if (!UUID.test(userId)) return NextResponse.json({ error: "Unknown user." }, { status: 400 });

  const { data: target } = await admin.from("profiles").select("id, email, role").eq("id", userId).single();
  if (!target) return NextResponse.json({ error: "Unknown user." }, { status: 404 });

  const full_name = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? target.role);
  const division = String(body.division ?? "").trim() || null;
  const phone = String(body.phone ?? "").trim() || null;

  if (!full_name) return NextResponse.json({ error: "Enter a name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!ROLES.includes(role)) return NextResponse.json({ error: "Unknown role." }, { status: 400 });

  if (callerRole !== "super_admin" && (target.role === "super_admin" || role === "super_admin")) {
    return NextResponse.json({ error: "Only a Super Admin can edit a Super Admin or grant that role." }, { status: 403 });
  }
  if (userId === callerId && role !== target.role) {
    return NextResponse.json({ error: "You can't change your own role. Ask another admin." }, { status: 403 });
  }

  if (email !== (target.email ?? "").toLowerCase()) {
    const { error } = await admin.auth.admin.updateUserById(userId, { email, email_confirm: true });
    if (error) {
      const exists = /already (been )?registered|already exists|email_exists/i.test(error.message);
      return NextResponse.json({ error: exists ? "Another user already uses this email." : error.message }, { status: exists ? 409 : 400 });
    }
  }

  const { error } = await admin.from("profiles").update({ full_name, email, role, division, phone }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
