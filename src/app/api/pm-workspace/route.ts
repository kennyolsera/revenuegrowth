import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Shared Project Timeline workspace (the Gr8r template in /public/project-timeline).
 * One JSON document for the whole team, stored in public.pm_workspace (RLS: active members only).
 * Saves are optimistic: the client sends the version it started from, and a save is refused
 * with 409 if someone else saved in between.
 */
export const dynamic = "force-dynamic";

const ROW_ID = "main";
const MAX_BYTES = 4_000_000;
const COLORS = ["#1468B3", "#23918A", "#8662C9", "#C48A1E", "#C54B78", "#3D8E5F", "#5A67D8", "#B4532A"];
const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  head_rg: "Head of Revenue Growth",
};

type Profile = { id: string; email: string | null; full_name: string | null; role: string | null; division: string | null; is_active: boolean | null };

function colorFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

function toMember(p: Profile) {
  const name = (p.full_name || "").trim() || (p.email || "Member").split("@")[0];
  return {
    id: p.id,
    name,
    email: p.email || "",
    role: p.role === "super_admin" ? "Owner" : p.role === "head_rg" ? "Admin" : "Member",
    team: "rg",
    title: p.division || ROLE_LABEL[p.role || ""] || "",
    c: colorFor(p.id),
    status: "active",
    last: 0,
    tz: "Jakarta",
  };
}

async function caller() {
  const supabase = createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,division,is_active")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  return { supabase, user, profile };
}

export async function GET(req: NextRequest) {
  const { supabase, user, profile } = await caller();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!profile?.is_active) return NextResponse.json({ error: "Your account is not active" }, { status: 403 });

  const { data: row, error } = await supabase.from("pm_workspace").select("doc,version").eq("id", ROW_ID).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const since = Number(req.nextUrl.searchParams.get("since"));
  if (Number.isFinite(since) && since > 0 && row && row.version <= since) {
    return new NextResponse(null, { status: 204 });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,division,is_active")
    .eq("is_active", true)
    .order("full_name");
  const members = ((profiles as Profile[] | null) || []).map(toMember);
  if (!members.some((m) => m.id === profile.id)) members.unshift(toMember(profile));
  const me = toMember(profile);

  let legacy = null;
  if (!row) {
    // First open: hand over the old Project Timeline data so it can be imported once.
    const [{ data: projects }, { data: tasks }] = await Promise.all([
      supabase.from("kanban_projects").select("id,name,description,owner,status,start_date,end_date").order("created_at"),
      supabase
        .from("kanban_tasks")
        .select("id,title,description,stage,priority,assignee,merchant_partner,due_date,checklist,position,project_id,started_at,completed_at,created_at,updated_at")
        .order("position"),
    ]);
    legacy = { projects: projects || [], tasks: tasks || [] };
  }

  return NextResponse.json(
    { doc: row?.doc ?? null, version: row?.version ?? 0, me: { id: me.id, name: me.name, title: me.title }, members, legacy },
    { headers: { "cache-control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  const { supabase, user, profile } = await caller();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!profile?.is_active) return NextResponse.json({ error: "Your account is not active" }, { status: 403 });

  const raw = await req.text();
  if (raw.length > MAX_BYTES) return NextResponse.json({ error: "Workspace is too large to save" }, { status: 413 });

  let body: { version?: unknown; doc?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const version = Number(body.version);
  const doc = body.doc as Record<string, unknown> | null;
  if (!Number.isInteger(version) || version < 0) return NextResponse.json({ error: "Invalid version" }, { status: 400 });
  if (!doc || typeof doc !== "object" || Array.isArray(doc) || !Array.isArray(doc.tasks) || !Array.isArray(doc.projects)) {
    return NextResponse.json({ error: "Invalid workspace" }, { status: 400 });
  }
  // Members come from User Management on every load; don't store a copy.
  const { members: _members, me: _me, ...stored } = doc;
  void _members;
  void _me;
  const now = new Date().toISOString();

  if (version === 0) {
    const { error } = await supabase.from("pm_workspace").insert({ id: ROW_ID, doc: stored, version: 1, updated_at: now, updated_by: user.id });
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "conflict" }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ version: 1 });
  }

  const { data, error } = await supabase
    .from("pm_workspace")
    .update({ doc: stored, version: version + 1, updated_at: now, updated_by: user.id })
    .eq("id", ROW_ID)
    .eq("version", version)
    .select("version");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "conflict" }, { status: 409 });
  return NextResponse.json({ version: data[0].version });
}
