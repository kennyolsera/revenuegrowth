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
  merchant_id uuid references public.merchants (id) on delete cascade, -- legacy, nullable
  qris_name text,                 -- registrant / QRIS name (from import)
  phone text,
  mid text,                       -- Merchant ID
  email text,
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  address text,
  region text,                    -- legacy, kept for existing rows
  status text not null default 'diajukan'
    check (status in ('diajukan', 'verifikasi', 'aktivasi', 'aktif', 'tidak_lanjut')),
  transaction_volume numeric,     -- deprecated (removed from UI)
  submitted_at date not null default current_date,
  date_estimated boolean not null default false, -- true = date was missing on import
  pic text,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3b. QRIS PROVIDERS (master, dikelola Super Admin di menu Settings)
-- ---------------------------------------------------------------------
create table if not exists public.qris_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Link QRIS acquisitions to a provider (nullable; historical rows stay valid)
alter table public.qris_acquisitions
  add column if not exists provider_id uuid references public.qris_providers (id) on delete set null;

create index if not exists idx_qris_acq_provider on public.qris_acquisitions (provider_id);

-- Migration for existing DBs: new import fields + relax legacy merchant_id
alter table public.qris_acquisitions alter column merchant_id drop not null;
alter table public.qris_acquisitions
  add column if not exists qris_name text,
  add column if not exists phone text,
  add column if not exists mid text,
  add column if not exists email text,
  add column if not exists bank_name text,
  add column if not exists bank_account_number text,
  add column if not exists bank_account_holder text,
  add column if not exists address text,
  add column if not exists date_estimated boolean not null default false;

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
-- 5b. ONLINE ORDER REPORTS (rekap transaksi per store; import/export)
-- ---------------------------------------------------------------------
create table if not exists public.online_order_reports (
  id uuid primary key default gen_random_uuid(),
  store text not null,
  url text,
  last_trans_date date,
  amount_pos_order numeric,
  amount_online_order numeric,
  total_online_order numeric,
  count_delivery numeric,
  amount_delivery numeric,
  total_delivery numeric,
  count_takeaway numeric,
  amount_takeaway numeric,
  total_takeaway numeric,
  count_dinein numeric,
  amount_dinein numeric,
  total_dinein numeric,
  count_reservation numeric,
  amount_reservation numeric,
  total_reservation numeric,
  trans_fee_delivery numeric,
  trans_fee_takeaway numeric,
  trans_fee_dinein numeric,
  trans_fee_reservation numeric,
  total_fee numeric,
  source_file text,
  imported_by text,
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
  merchant_id uuid references public.merchants (id) on delete set null, -- legacy
  merchant_partner text,                       -- free-text merchant/partner
  participants text,
  discussion_points text,
  action_items jsonb not null default '[]',
  attachments jsonb not null default '[]',     -- [{ name, path, type }]
  created_by text,
  created_at timestamptz not null default now()
);

-- Migration for existing DBs
alter table public.meeting_minutes
  add column if not exists merchant_partner text,
  add column if not exists attachments jsonb not null default '[]';

-- ---------------------------------------------------------------------
-- 11b. FINANCING PERFORMANCE REPORTS (agregat dari export GoTyme)
--      Mendukung periode bulanan & mingguan + kolom ringkasan
--      (Launch-to-Date / Yearly / YTD). Disimpan apa adanya
--      ("import as-is"); anomali ditandai di aplikasi.
-- ---------------------------------------------------------------------
create table if not exists public.financing_reports (
  id uuid primary key default gen_random_uuid(),
  period_type text not null check (period_type in ('month','week','ltd','yearly','ytd')),
  period_key text not null unique,
  period_label text not null,
  year int not null,
  month int check (month between 1 and 12),
  week_no int check (week_no between 1 and 6),
  sort_key numeric not null default 0,
  -- Reach / base
  days numeric,
  working_days numeric,
  offer_unique_merchants numeric,
  business_owner_a numeric,           -- A (activation denominator)
  total_site_visits numeric,
  less_active_loan numeric,
  new_applicant_visits numeric,
  unique_merchant_ids numeric,
  -- Application journey
  intro_page numeric,
  slider_activity numeric,
  otp_verification numeric,
  id_verification numeric,
  facial_verification numeric,
  bank_info_confirmation numeric,
  loan_agreement_opened numeric,
  loan_agreement_review numeric,
  application_completed numeric,      -- B
  total_attempts numeric,             -- C
  -- Conversion
  contract_rejected numeric,
  contract_approved numeric,
  new_loan numeric,                   -- D
  loan_dashboard numeric,
  new_loan_per_working_day numeric,
  -- Finance (Rp)
  disbursed_amount numeric,
  avg_disbursed_loan_amount numeric,
  expected_fee numeric,               -- F
  less_15 numeric,                    -- G
  net_fee numeric,                    -- F - G
  commission_10 numeric,
  source_file text,
  imported_by text,
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
alter table public.qris_providers enable row level security;
alter table public.network_partner_handovers enable row level security;
alter table public.online_order_activities enable row level security;
alter table public.online_order_reports enable row level security;
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
alter table public.financing_reports enable row level security;

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

-- qris providers: baca oleh tim internal, tulis HANYA super admin ------
drop policy if exists "qris_providers_select_internal" on public.qris_providers;
create policy "qris_providers_select_internal" on public.qris_providers
  for select using (public.is_internal());

drop policy if exists "qris_providers_write_super" on public.qris_providers;
create policy "qris_providers_write_super" on public.qris_providers
  for all using (public.current_profile_role() = 'super_admin')
  with check (public.current_profile_role() = 'super_admin');

drop policy if exists "network_partner_internal_all" on public.network_partner_handovers;
create policy "network_partner_internal_all" on public.network_partner_handovers
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "online_order_internal_all" on public.online_order_activities;
create policy "online_order_internal_all" on public.online_order_activities
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "online_order_reports_internal_all" on public.online_order_reports;
create policy "online_order_reports_internal_all" on public.online_order_reports
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

-- financing performance reports: baca oleh tim internal, tulis oleh admin/head
drop policy if exists "fin_reports_select_internal" on public.financing_reports;
create policy "fin_reports_select_internal" on public.financing_reports
  for select using (public.is_internal());

drop policy if exists "fin_reports_write_admin" on public.financing_reports;
create policy "fin_reports_write_admin" on public.financing_reports
  for all using (public.is_admin_or_head()) with check (public.is_admin_or_head());

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
insert into public.qris_providers (name) values
  ('Netzme'),
  ('BCA')
on conflict (name) do nothing;

insert into public.request_categories (name, description) values
  ('Demo Produk', 'Permintaan demo fitur VAS ke merchant/klien'),
  ('Onboarding Merchant', 'Bantuan proses onboarding merchant baru'),
  ('Support Teknis', 'Kendala teknis yang memerlukan bantuan tim Revenue Growth'),
  ('Permintaan Data/Informasi', 'Kebutuhan data atau informasi terkait layanan VAS'),
  ('Kebutuhan Dokumen/Perjanjian', 'Permintaan dokumen atau perjanjian kerja sama'),
  ('Lainnya', 'Kategori umum di luar daftar di atas')
on conflict (name) do nothing;

-- =====================================================================
-- 13. KANBAN BOARD (alur kerja end-to-end tim Revenue Growth)
--     Backlog → To Do → In Progress → Review → Done
--     Kartu bisa dibuat manual atau ditarik dari Action Item MOM /
--     Request Form (source_type + source_id + source_ref, anti-duplikat).
--     Riwayat perpindahan stage dicatat otomatis oleh trigger.
--     Lihat docs/KANBAN_FLOW.md untuk detail alur.
-- =====================================================================
create table if not exists public.kanban_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  stage text not null default 'backlog'
    check (stage in ('backlog', 'todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  module text not null default 'internal'
    check (module in ('qris', 'online_order', 'financing', 'network_partner', 'commission', 'request', 'internal')),
  assignee text,
  merchant_partner text,
  due_date date,
  checklist jsonb not null default '[]',        -- [{ label, done }]
  position numeric not null default 0,          -- urutan kartu di dalam kolom
  is_blocked boolean not null default false,
  blocked_reason text,
  source_type text not null default 'manual'
    check (source_type in ('manual', 'mom', 'request')),
  source_id uuid,                               -- meeting_minutes.id / requests.id
  source_ref int,                               -- index action item pada MOM
  started_at timestamptz,                       -- pertama kali masuk In Progress
  completed_at timestamptz,                     -- masuk Done
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_kanban_source
  on public.kanban_tasks (source_type, source_id, coalesce(source_ref, -1))
  where source_type <> 'manual';
create index if not exists idx_kanban_stage_pos on public.kanban_tasks (stage, position);

create table if not exists public.kanban_task_activities (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.kanban_tasks (id) on delete cascade,
  kind text not null check (kind in ('created', 'moved', 'comment', 'blocked', 'unblocked')),
  from_stage text,
  to_stage text,
  body text,
  actor text,
  created_at timestamptz not null default now()
);

create index if not exists idx_kanban_activity_task on public.kanban_task_activities (task_id, created_at desc);

-- Timestamp siklus + riwayat otomatis (tidak bergantung pada client)
create or replace function public.kanban_tasks_track()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor text := coalesce(auth.jwt() ->> 'email', 'System');
begin
  if tg_op = 'INSERT' then
    if new.stage in ('in_progress', 'review', 'done') then
      new.started_at := coalesce(new.started_at, now());
    end if;
    if new.stage = 'done' then
      new.completed_at := coalesce(new.completed_at, now());
    end if;
    return new;
  end if;

  new.updated_at := now();
  if new.stage is distinct from old.stage then
    if new.stage in ('in_progress', 'review', 'done') and old.started_at is null then
      new.started_at := now();
    end if;
    new.completed_at := case when new.stage = 'done' then now() else null end;
    insert into public.kanban_task_activities (task_id, kind, from_stage, to_stage, actor)
    values (new.id, 'moved', old.stage, new.stage, v_actor);
  end if;
  if new.is_blocked is distinct from old.is_blocked then
    insert into public.kanban_task_activities (task_id, kind, body, actor)
    values (new.id, case when new.is_blocked then 'blocked' else 'unblocked' end, new.blocked_reason, v_actor);
  end if;
  return new;
end;
$$;

create or replace function public.kanban_tasks_log_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.kanban_task_activities (task_id, kind, to_stage, actor)
  values (new.id, 'created', new.stage, coalesce(auth.jwt() ->> 'email', new.created_by, 'System'));
  return new;
end;
$$;

drop trigger if exists kanban_tasks_track on public.kanban_tasks;
create trigger kanban_tasks_track
  before insert or update on public.kanban_tasks
  for each row execute function public.kanban_tasks_track();

drop trigger if exists kanban_tasks_log_created on public.kanban_tasks;
create trigger kanban_tasks_log_created
  after insert on public.kanban_tasks
  for each row execute function public.kanban_tasks_log_created();

alter table public.kanban_tasks enable row level security;
alter table public.kanban_task_activities enable row level security;

drop policy if exists "kanban_tasks_internal_all" on public.kanban_tasks;
create policy "kanban_tasks_internal_all" on public.kanban_tasks
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "kanban_activity_select_internal" on public.kanban_task_activities;
create policy "kanban_activity_select_internal" on public.kanban_task_activities
  for select using (public.is_internal());

-- Riwayat bersifat append-only: client hanya boleh menambah komentar
drop policy if exists "kanban_activity_insert_comment" on public.kanban_task_activities;
create policy "kanban_activity_insert_comment" on public.kanban_task_activities
  for insert with check (public.is_internal() and kind = 'comment');

-- ---------------------------------------------------------------------
-- 14. KANBAN PROJECTS + TIMELINE (2026-10-26, ADR-005)
--     Same SQL as supabase/migrations/20261026_kanban_projects.sql
-- ---------------------------------------------------------------------
create table if not exists public.kanban_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text,
  owner text,                                    -- PIC, same convention as kanban_tasks.assignee
  module text not null default 'internal'
    check (module in ('qris', 'online_order', 'financing', 'network_partner', 'commission', 'request', 'internal')),
  start_date date not null,
  end_date date not null,
  status text not null default 'active'
    check (status in ('planning', 'active', 'on_hold', 'done', 'cancelled')),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kanban_projects_dates check (end_date >= start_date)
);

create index if not exists idx_kanban_projects_dates on public.kanban_projects (start_date, end_date);

-- Cards optionally belong to one project. Deleting a project keeps its cards.
alter table public.kanban_tasks
  add column if not exists project_id uuid references public.kanban_projects (id) on delete set null;

create index if not exists idx_kanban_tasks_project on public.kanban_tasks (project_id);

-- updated_at
create or replace function public.kanban_projects_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists kanban_projects_touch on public.kanban_projects;
create trigger kanban_projects_touch
  before update on public.kanban_projects
  for each row execute function public.kanban_projects_touch();

-- Same access as the board: internal roles only.
alter table public.kanban_projects enable row level security;

drop policy if exists "kanban_projects_internal_all" on public.kanban_projects;
create policy "kanban_projects_internal_all" on public.kanban_projects
  for all using (public.is_internal()) with check (public.is_internal());
