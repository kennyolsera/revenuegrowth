import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Route Handler untuk mengundang pengguna baru via email menggunakan
 * Supabase Auth Admin API. Route ini SATU-SATUNYA tempat yang boleh
 * memakai SUPABASE_SERVICE_ROLE_KEY — jangan pernah mengekspos key ini
 * ke browser / kode client (karena itu env var ini TIDAK diberi awalan
 * NEXT_PUBLIC_).
 *
 * Perlu SUPABASE_SERVICE_ROLE_KEY diisi di Environment Variables Vercel
 * agar endpoint ini berfungsi. Tanpa itu, undang pengguna baru dapat
 * dilakukan manual lewat Supabase Dashboard > Authentication > Users > Invite.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY belum diset di server. Undang pengguna secara manual lewat Supabase Dashboard, atau set env var ini lalu deploy ulang.",
      },
      { status: 501 }
    );
  }

  const { email, full_name, role, division } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  const admin = createClient(url, serviceKey);

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role, division },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Jika ada trigger handle_new_user (lihat supabase/schema.sql), baris profiles
  // akan otomatis dibuat. Sebagai jaga-jaga, upsert manual di sini juga:
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
