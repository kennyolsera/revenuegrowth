-- =====================================================================
-- Revenue Growth Dashboard — Supabase Schema
-- =====================================================================
-- Jalankan file ini sekali di Supabase Dashboard > SQL Editor pada
-- project yang akan dipakai. Aman dijalankan ulang (idempotent) berkat
-- IF NOT EXISTS / ON CONFLICT DO NOTHING di sebagian besar statement.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. PROFILES (perluasan auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  role text not null default 'team_rg'
    check (role in ('super_admin', 'head_rg', 'team_rg', 'external_team', 'finance_ops')),
  division text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. MASTER MERCHANTS
-- ---------------------------------------------------------------------
create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  region text,
  phone text,
  pic_internal text,
  source text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. AKUISISI QRIS
-- ---------------------------------------------------------------------
create table if not exists public.qris_acquisitions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  region text,
  status text not null default 'diajukan'
    check (status in ('diajukan', 'verifikasi', 'aktivasi', 'aktif', 'tidak_lanjut')),
  transaction_volume numeric,
  submitted_at date not null default current_date,
  pic text,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. AKUISISI NETWORK PARTNER
-- ---------------------------------------------------------------------
create table if not exists public.network_partner_handovers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  partner_name text not null,
  contact_person text,
  status text not null default 'draft'
    check (status in ('draft', 'siap_handover', 'terkirim', 'diproses_partner', 'selesai', 'ditolak')),
  pic text,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. AKUISISI ONLINE ORDER
-- ---------------------------------------------------------------------
create table if not exists public.online_order_activities (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  activity_type text not null check (activity_type in ('demo', 'onboarding', 'support', 'upgrade')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'baru' check (status in ('baru', 'dijadwalkan', 'diproses', 'selesai', 'batal')),
  pic text,
  scheduled_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. FINANCING LOAN + IMPORT BATCHES
-- ---------------------------------------------------------------------
create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  file_name text,
  uploaded_by text,
  row_count int not null default 0,
  status text not null default 'selesai',
  created_at timestamptz not null default now()
);

create table if not exists public.financing_loans (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  loan_amount numeric not null,
  disbursed_at date,
  revenue_before numeric,
  revenue_after numeric,
  status text not null default 'diajukan'
    check (status in ('diajukan', 'disetujui', 'dicairkan', 'lunas', 'bermasalah')),
  import_batch_id uuid references public.import_batches (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. STATUS MERCHANT & KLAIM KOMISI
-- ---------------------------------------------------------------------
create table if not exists public.merchant_status_claims (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  feature text not null,
  submitted_by_team text not null,
  submitted_by uuid default auth.uid() references public.profiles (id) on delete set null,
  checklist jsonb not null default '[]',
  status text not null default 'diajukan'
    check (status in ('diajukan', 'review', 'menunggu_dokumen', 'disetujui', 'ditolak')),
  commission_estimate numeric,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. REQUEST FORM
-- ---------------------------------------------------------------------
create table if not exists public.request_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.request_categories (id) on delete set null,
  title text not null,
  description text,
  requester_name text not null,
  requester_division text,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'baru' check (status in ('baru', 'ditugaskan', 'diproses', 'selesai', 'batal')),
  assigned_pic text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. REPORT MINGGUAN
-- ---------------------------------------------------------------------
create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  demo_count int not null default 0,
  onboard_count int not null default 0,
  support_count int not null default 0,
  summary text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. DATA LEADS (RAW EXCEL)
-- ---------------------------------------------------------------------
create table if not exists public.leads_raw_data (
  id uuid primary key default gen_random_uuid(),
  feature_category text not null,
  file_name text not null,
  storage_path text not null,
  uploaded_by text,
  row_count int not null default 0,
  status text not null default 'baru' check (status in ('baru', 'diproses')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 11. CALENDAR & MOM
-- ---------------------------------------------------------------------
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null default 'lainnya'
    check (event_type in ('demo', 'onboarding', 'support', 'internal', 'lainnya')),
  start_time timestamptz not null,
  end_time timestamptz not null,
  merchant_id uuid references public.merchants (id) on delete set null,
  organizer text,
  attendees text,
  meeting_link text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.meeting_minutes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date date not null default current_date,
  category text,
  merchant_id uuid references public.merchants (id) on delete set null,
  participants text,
  discussion_points text,
  action_items jsonb not null default '[]',
  created_by text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 12. AUDIT LOG & NOTIFICATIONS (disiapkan untuk pengembangan lanjutan)
-- ---------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid,
  action text not null,
  changed_by text,
  changed_at timestamptz not null default now(),
  old_value jsonb,
  new_value jsonb
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  type text,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- HELPER FUNCTIONS (dipakai oleh RLS policy)
-- =====================================================================
create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin_or_head()
returns boolean
language sql
stable
as $$
  select public.current_profile_role() in ('super_admin', 'head_rg');
$$;

create or replace function public.is_internal()
returns boolean
language sql
stable
as $$
  select public.current_profile_role() in ('super_admin', 'head_rg', 'team_rg', 'finance_ops');
$$;

-- Auto-buat baris profiles saat ada user baru (signup / invite)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, division, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'team_rg'),
    new.raw_user_meta_data ->> 'division',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.merchants enable row level security;
alter table public.qris_acquisitions enable row level security;
alter table public.network_partner_handovers enable row level security;
alter table public.online_order_activities enable row level security;
alter table public.import_batches enable row level security;
alter table public.financing_loans enable row level security;
alter table public.merchant_status_claims enable row level security;
alter table public.request_categories enable row level security;
alter table public.requests enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.leads_raw_data enable row level security;
alter table public.calendar_events enable row level security;
alter table public.meeting_minutes enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- profiles ------------------------------------------------------------
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id or public.is_admin_or_head());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin_or_head());

-- merchants (direktori bersama — semua role login boleh lihat) --------
drop policy if exists "merchants_select_all" on public.merchants;
create policy "merchants_select_all" on public.merchants
  for select using (auth.role() = 'authenticated');

drop policy if exists "merchants_write_internal" on public.merchants;
create policy "merchants_write_internal" on public.merchants
  for all using (public.is_internal()) with check (public.is_internal());

-- modul akuisisi: hanya tim internal ----------------------------------
drop policy if exists "qris_internal_all" on public.qris_acquisitions;
create policy "qris_internal_all" on public.qris_acquisitions
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "network_partner_internal_all" on public.network_partner_handovers;
create policy "network_partner_internal_all" on public.network_partner_handovers
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "online_order_internal_all" on public.online_order_activities;
create policy "online_order_internal_all" on public.online_order_activities
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "import_batches_internal_all" on public.import_batches;
create policy "import_batches_internal_all" on public.import_batches
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "financing_loans_internal_all" on public.financing_loans;
create policy "financing_loans_internal_all" on public.financing_loans
  for all using (public.is_internal()) with check (public.is_internal());

-- status merchant & klaim komisi ---------------------------------------
drop policy if exists "claims_select" on public.merchant_status_claims;
create policy "claims_select" on public.merchant_status_claims
  for select using (public.is_internal() or submitted_by = auth.uid());

drop policy if exists "claims_insert" on public.merchant_status_claims;
create policy "claims_insert" on public.merchant_status_claims
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "claims_update_internal" on public.merchant_status_claims;
create policy "claims_update_internal" on public.merchant_status_claims
  for update using (public.is_internal());

drop policy if exists "claims_delete_internal" on public.merchant_status_claims;
create policy "claims_delete_internal" on public.merchant_status_claims
  for delete using (public.is_internal());

-- request categories: baca oleh semua, tulis oleh admin/head ----------
drop policy if exists "request_categories_select" on public.request_categories;
create policy "request_categories_select" on public.request_categories
  for select using (auth.role() = 'authenticated');

drop policy if exists "request_categories_write_admin" on public.request_categories;
create policy "request_categories_write_admin" on public.request_categories
  for all using (public.is_admin_or_head()) with check (public.is_admin_or_head());

-- requests --------------------------------------------------------------
drop policy if exists "requests_select" on public.requests;
create policy "requests_select" on public.requests
  for select using (public.is_internal() or created_by = auth.uid());

drop policy if exists "requests_insert" on public.requests;
create policy "requests_insert" on public.requests
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "requests_update_internal" on public.requests;
create policy "requests_update_internal" on public.requests
  for update using (public.is_internal());

drop policy if exists "requests_delete_internal" on public.requests;
create policy "requests_delete_internal" on public.requests
  for delete using (public.is_internal());

-- modul internal-only lainnya -------------------------------------------
drop policy if exists "weekly_reports_internal_all" on public.weekly_reports;
create policy "weekly_reports_internal_all" on public.weekly_reports
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "leads_raw_internal_all" on public.leads_raw_data;
create policy "leads_raw_internal_all" on public.leads_raw_data
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "calendar_internal_all" on public.calendar_events;
create policy "calendar_internal_all" on public.calendar_events
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "mom_internal_all" on public.meeting_minutes;
create policy "mom_internal_all" on public.meeting_minutes
  for all using (public.is_internal()) with check (public.is_internal());

-- audit & notifications ---------------------------------------------------
drop policy if exists "audit_select_admin" on public.audit_logs;
create policy "audit_select_admin" on public.audit_logs
  for select using (public.is_admin_or_head());

drop policy if exists "audit_insert_internal" on public.audit_logs;
create policy "audit_insert_internal" on public.audit_logs
  for insert with check (public.is_internal());

drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================================
-- STORAGE BUCKETS
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('leads-raw', 'leads-raw', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mom-attachments', 'mom-attachments', false)
on conflict (id) do nothing;

drop policy if exists "leads_raw_storage_internal" on storage.objects;
create policy "leads_raw_storage_internal" on storage.objects
  for all using (bucket_id = 'leads-raw' and public.is_internal())
  with check (bucket_id = 'leads-raw' and public.is_internal());

drop policy if exists "mom_attachments_storage_internal" on storage.objects;
create policy "mom_attachments_storage_internal" on storage.objects
  for all using (bucket_id = 'mom-attachments' and public.is_internal())
  with check (bucket_id = 'mom-attachments' and public.is_internal());

-- =====================================================================
-- SEED DATA
-- =====================================================================
insert into public.request_categories (name, description) values
  ('Demo Produk', 'Permintaan demo fitur VAS ke merchant/klien'),
  ('Onboarding Merchant', 'Bantuan proses onboarding merchant baru'),
  ('Support Teknis', 'Kendala teknis yang memerlukan bantuan tim Revenue Growth'),
  ('Permintaan Data/Informasi', 'Kebutuhan data atau informasi terkait layanan VAS'),
  ('Kebutuhan Dokumen/Perjanjian', 'Permintaan dokumen atau perjanjian kerja sama'),
  ('Lainnya', 'Kategori umum di luar daftar di atas')
on conflict (name) do nothing;
