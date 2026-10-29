import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Project Timeline attachments (ADR-015), private bucket `pm-attachments`.
 * POST  { name, size }   -> signed upload URL; the browser uploads straight to Storage (no Vercel body limit).
 * GET   ?path=...&dl=1   -> 302 to a short-lived signed URL (inline preview, or download with the original name).
 * Storage RLS also requires an active member, so this route is a convenience, not the only gate.
 */
export const dynamic = "force-dynamic";

const BUCKET = "pm-attachments";
const MAX_BYTES = 25 * 1024 * 1024;
const PATH_RE = /^t\/\d{4}-\d{2}\/[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,100}$/;

async function activeCaller() {
  const supabase = createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { supabase, error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("is_active").eq("id", auth.user.id).maybeSingle<{ is_active: boolean | null }>();
  if (!profile?.is_active) return { supabase, error: NextResponse.json({ error: "Your account is not active" }, { status: 403 }) };
  return { supabase, error: null };
}

function safeName(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/^[._]+/, "")
    .slice(-100);
  return cleaned || "file";
}

export async function POST(req: NextRequest) {
  const { supabase, error } = await activeCaller();
  if (error) return error;
  let body: { name?: unknown; size?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name : "";
  const size = Number(body.size);
  if (!name || !Number.isFinite(size) || size <= 0) return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  if (size > MAX_BYTES) return NextResponse.json({ error: "Files can be up to 25 MB" }, { status: 413 });

  const month = new Date().toISOString().slice(0, 7);
  const path = `t/${month}/${randomUUID()}/${safeName(name)}`;
  const { data, error: upErr } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (upErr || !data) return NextResponse.json({ error: upErr?.message || "Could not start upload" }, { status: 500 });
  return NextResponse.json({ path, url: data.signedUrl }, { headers: { "cache-control": "no-store" } });
}

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") || "";
  if (!PATH_RE.test(path)) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  const { supabase, error } = await activeCaller();
  if (error) return error;
  const dl = req.nextUrl.searchParams.get("dl") === "1";
  const original = (req.nextUrl.searchParams.get("name") || path.split("/").pop() || "file").slice(0, 200);
  const { data, error: sErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300, dl ? { download: original } : undefined);
  if (sErr || !data) return NextResponse.json({ error: "File not found" }, { status: 404 });
  return NextResponse.redirect(data.signedUrl, { status: 302, headers: { "cache-control": "private, max-age=240" } });
}
