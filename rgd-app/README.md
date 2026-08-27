# Revenue Growth Dashboard

Frontend web app untuk divisi Revenue Growth (VAS) — dibangun dengan **Next.js 14
+ TypeScript + Tailwind CSS**, database & auth **Supabase**, siap di-deploy ke
**Vercel**. Berisi 12 modul sesuai PRD: Dashboard, Akuisisi QRIS, Network
Partner, Online Order, Financing Loan (+ import Excel & grafik growth), Status
Merchant & Klaim Komisi, Request Form, Report Mingguan, Data Leads, Calendar &
Meeting, MOM/Notulen, dan User & Role Management.

Status saat ini: **UI + integrasi Supabase sudah lengkap (CRUD nyata ke
database)**. Yang perlu Anda lakukan hanya menghubungkan project Supabase Anda
sendiri, lalu deploy. Tanpa Supabase terhubung, aplikasi tetap bisa dibuka
(tampilan lengkap) tapi datanya kosong — ada banner kuning pengingat di setiap
halaman.

## 1. Jalankan di komputer Anda (opsional, untuk cek dulu)

```bash
npm install
cp .env.example .env.local   # lalu isi dua variabel di dalamnya (lihat langkah 2)
npm run dev
```

Buka http://localhost:3000 — jika `.env.local` belum diisi, aplikasi tetap
terbuka dengan data kosong (banner "Supabase belum terhubung" akan muncul).

## 2. Menghubungkan Supabase (wajib agar data benar-benar tersimpan)

1. Buat project baru di [supabase.com](https://supabase.com) (gratis untuk mulai).
2. Buka **SQL Editor** di dashboard Supabase, tempel seluruh isi file
   `supabase/schema.sql` dari folder ini, lalu **Run**. Script ini membuat semua
   tabel, keamanan Row Level Security (RLS) per role, storage bucket untuk
   lampiran, dan beberapa data awal (kategori Request Form).
3. Buka **Project Settings > API**, salin:
   - `Project URL` → jadi `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → jadi `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` (opsional, untuk fitur undang pengguna) → jadi
     `SUPABASE_SERVICE_ROLE_KEY`
4. Buat user pertama Anda: **Authentication > Users > Invite user**, masukkan
   email Anda.
5. Jadikan diri Anda **Super Admin** — buka SQL Editor lagi dan jalankan:
   ```sql
   update public.profiles set role = 'super_admin' where email = 'email-anda@perusahaan.com';
   ```
6. Selesai — login ke aplikasi dengan email & password akun tersebut.

## 3. Deploy ke Vercel (paling cepat)

**Opsi A — lewat GitHub (disarankan):**
1. Push folder ini ke repository GitHub baru.
2. Buka [vercel.com/new](https://vercel.com/new), import repository tersebut.
3. Saat diminta Environment Variables, isi 2–3 variabel dari langkah 2 di atas
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan opsional
   `SUPABASE_SERVICE_ROLE_KEY`).
4. Klik **Deploy**. Selesai dalam ± 1–2 menit, Anda mendapat URL `*.vercel.app`.

**Opsi B — lewat Vercel CLI (tanpa GitHub):**
```bash
npm install -g vercel
vercel login
vercel            # ikuti instruksi, pilih "Link to existing project? No"
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod
```

Setiap kali kode diubah, jalankan `vercel --prod` lagi (atau otomatis ter-deploy
jika sudah terhubung ke GitHub).

## 4. Struktur Proyek

```
src/
  app/
    login/                → halaman login (Supabase Auth)
    (app)/                → seluruh halaman setelah login (sidebar + topbar)
      dashboard/
      qris/
      network-partner/
      online-order/
      financing-loan/
      merchant-status/
      requests/
      weekly-report/
      leads/
      calendar/
      mom/
      users/
    api/invite-user/      → endpoint server untuk undang pengguna baru
  components/
    ui/                   → komponen dasar (Button, Input, Card, Badge, Dialog)
    layout/                → Sidebar & Topbar
    shared/                → ResourceManager (CRUD generik), DataTable, Toolbar
    dashboard/, financing/, calendar/ → komponen khusus per modul
  lib/
    supabase/              → client & server Supabase
    hooks/                 → useMerchantOptions, useTableOptions
    types.ts, utils.ts
supabase/
  schema.sql               → seluruh DDL, RLS policy, storage bucket, seed data
```

## 5. Catatan & Batasan Versi Ini

- **Report Mingguan** saat ini diisi manual (form input jumlah demo/onboarding/
  support). Auto-rekap dari modul lain bisa ditambahkan sebagai Supabase Edge
  Function / scheduled job pada iterasi berikutnya.
- **Undang pengguna** memerlukan `SUPABASE_SERVICE_ROLE_KEY` diisi di
  Environment Variables server. Tanpa itu, undang manual lewat Supabase
  Dashboard > Authentication > Users tetap bisa dilakukan.
- Desain menggunakan palet warna & komponen konsisten di seluruh modul (lihat
  `tailwind.config.ts`) sesuai prinsip "rapi, profesional, konsisten" pada PRD.
- RLS di `schema.sql` sudah membedakan akses **tim internal** vs **tim
  eksternal** sesuai matriks peran di PRD — sempurnakan lebih lanjut sesuai
  kebutuhan nyata sebelum go-live penuh.
- Untuk detail kebutuhan fungsional lengkap, lihat dokumen
  `PRD Revenue Growth Dashboard v1.0` yang sudah dibuat sebelumnya.
