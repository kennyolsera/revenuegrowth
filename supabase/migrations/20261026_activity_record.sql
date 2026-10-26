-- =====================================================================
-- 2026-10-26 · Activity Record (ADR-008)
-- The team's activity sheet, with six editable, coloured option lists.
-- Additive and idempotent.
-- =====================================================================

create table if not exists public.activity_options (
  id uuid primary key default gen_random_uuid(),
  field text not null check (field in ('subs', 'source', 'scope', 'product', 'status', 'flagging')),
  label text not null check (char_length(trim(label)) between 1 and 120),
  color text not null default 'gray'
    check (color in ('blue', 'green', 'amber', 'red', 'violet', 'teal', 'orange', 'rose', 'gray')),
  sort int not null default 100,
  created_at timestamptz not null default now(),
  -- Target for the field-scoped foreign keys on activity_records.
  constraint activity_options_field_id_key unique (field, id)
);

create unique index if not exists uq_activity_options_label on public.activity_options (field, lower(trim(label)));

create table if not exists public.activity_records (
  id uuid primary key default gen_random_uuid(),
  activity_date date,
  store_name text not null check (char_length(trim(store_name)) between 1 and 200),
  phone text check (phone is null or char_length(phone) <= 40),
  store_url text check (store_url is null or char_length(store_url) <= 500),
  subs_id uuid,
  source_id uuid,
  scope_id uuid,
  product_id uuid,
  status_id uuid,
  flagging_id uuid,
  notes text check (notes is null or char_length(notes) <= 2000),
  -- Constant columns so each option column can only point at its own list.
  subs_field text generated always as ('subs') stored,
  source_field text generated always as ('source') stored,
  scope_field text generated always as ('scope') stored,
  product_field text generated always as ('product') stored,
  status_field text generated always as ('status') stored,
  flagging_field text generated always as ('flagging') stored,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_records_subs_fk foreign key (subs_field, subs_id) references public.activity_options (field, id) on delete restrict,
  constraint activity_records_source_fk foreign key (source_field, source_id) references public.activity_options (field, id) on delete restrict,
  constraint activity_records_scope_fk foreign key (scope_field, scope_id) references public.activity_options (field, id) on delete restrict,
  constraint activity_records_product_fk foreign key (product_field, product_id) references public.activity_options (field, id) on delete restrict,
  constraint activity_records_status_fk foreign key (status_field, status_id) references public.activity_options (field, id) on delete restrict,
  constraint activity_records_flagging_fk foreign key (flagging_field, flagging_id) references public.activity_options (field, id) on delete restrict
);

create index if not exists idx_activity_records_date on public.activity_records (activity_date desc nulls last, created_at desc);
create index if not exists idx_activity_records_subs on public.activity_records (subs_id);
create index if not exists idx_activity_records_source on public.activity_records (source_id);
create index if not exists idx_activity_records_scope on public.activity_records (scope_id);
create index if not exists idx_activity_records_product on public.activity_records (product_id);
create index if not exists idx_activity_records_status on public.activity_records (status_id);
create index if not exists idx_activity_records_flagging on public.activity_records (flagging_id);

create or replace function public.activity_records_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists activity_records_touch on public.activity_records;
create trigger activity_records_touch
  before update on public.activity_records
  for each row execute function public.activity_records_touch();

-- Starting options, coloured like the team's sheet.
insert into public.activity_options (field, label, color, sort) values
  ('source', 'Admin Panel', 'violet', 10),
  ('source', 'Direct Chat', 'teal', 20),
  ('source', 'G-form', 'amber', 30),
  ('source', 'Grup VAS', 'blue', 40),
  ('scope', 'Onboard', 'blue', 10),
  ('product', 'Netzme', 'blue', 10),
  ('product', 'Soundbox', 'gray', 20),
  ('product', 'Zenwell', 'violet', 30),
  ('status', 'Closed', 'red', 10),
  ('flagging', 'Konsultasi QRIS (aktivasi, settlement, MDR, dll)', 'gray', 10)
on conflict do nothing;

alter table public.activity_options enable row level security;
alter table public.activity_records enable row level security;

drop policy if exists "activity_options_internal_all" on public.activity_options;
create policy "activity_options_internal_all" on public.activity_options
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "activity_records_internal_all" on public.activity_records;
create policy "activity_records_internal_all" on public.activity_records
  for all using (public.is_internal()) with check (public.is_internal());

-- The trigger function is not an API endpoint.
revoke execute on function public.activity_records_touch() from public, anon, authenticated;
