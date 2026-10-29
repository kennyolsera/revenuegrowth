-- =====================================================================
-- 2026-10-29 · Activity Online Order (ADR-013, same design as Activity Record / ADR-008)
-- The online-order follow-up sheet, with five editable, coloured option lists:
-- subscription, Status FU, Sumber Data, Produk, Perihal. Additive and idempotent.
-- (Named online_order_followups because online_order_activities already exists for another feature.)
-- =====================================================================

create table if not exists public.online_order_followup_options (
  id uuid primary key default gen_random_uuid(),
  field text not null check (field in ('subs', 'status', 'source', 'product', 'perihal')),
  label text not null check (char_length(trim(label)) between 1 and 120),
  color text not null default 'gray'
    check (color in ('blue', 'green', 'amber', 'red', 'violet', 'teal', 'orange', 'rose', 'gray')),
  sort int not null default 100,
  created_at timestamptz not null default now(),
  constraint online_order_followup_options_field_id_key unique (field, id)
);

create unique index if not exists uq_oo_followup_options_label on public.online_order_followup_options (field, lower(trim(label)));

create table if not exists public.online_order_followups (
  id uuid primary key default gen_random_uuid(),
  activity_date date,
  store_name text not null check (char_length(trim(store_name)) between 1 and 200), -- the store's URL name
  phone text check (phone is null or char_length(phone) <= 40),
  subs_id uuid,
  status_id uuid,
  source_id uuid,
  product_id uuid,
  perihal_id uuid,
  minutes int check (minutes is null or minutes between 0 and 1440),
  notes text check (notes is null or char_length(notes) <= 2000),
  subs_field text generated always as ('subs') stored,
  status_field text generated always as ('status') stored,
  source_field text generated always as ('source') stored,
  product_field text generated always as ('product') stored,
  perihal_field text generated always as ('perihal') stored,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oo_followups_subs_fk foreign key (subs_field, subs_id) references public.online_order_followup_options (field, id) on delete restrict,
  constraint oo_followups_status_fk foreign key (status_field, status_id) references public.online_order_followup_options (field, id) on delete restrict,
  constraint oo_followups_source_fk foreign key (source_field, source_id) references public.online_order_followup_options (field, id) on delete restrict,
  constraint oo_followups_product_fk foreign key (product_field, product_id) references public.online_order_followup_options (field, id) on delete restrict,
  constraint oo_followups_perihal_fk foreign key (perihal_field, perihal_id) references public.online_order_followup_options (field, id) on delete restrict
);

create index if not exists idx_oo_followups_date on public.online_order_followups (activity_date desc nulls last, created_at desc);
create index if not exists idx_oo_followups_subs on public.online_order_followups (subs_id);
create index if not exists idx_oo_followups_status on public.online_order_followups (status_id);
create index if not exists idx_oo_followups_source on public.online_order_followups (source_id);
create index if not exists idx_oo_followups_product on public.online_order_followups (product_id);
create index if not exists idx_oo_followups_perihal on public.online_order_followups (perihal_id);

create or replace function public.online_order_followups_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists online_order_followups_touch on public.online_order_followups;
create trigger online_order_followups_touch
  before update on public.online_order_followups
  for each row execute function public.online_order_followups_touch();

-- Starting options, coloured like the team's sheet.
insert into public.online_order_followup_options (field, label, color, sort) values
  ('subs', 'Basic', 'gray', 10),
  ('subs', 'Pro', 'teal', 20),
  ('subs', 'Premium', 'violet', 30),
  ('status', 'Closed', 'red', 10),
  ('source', 'Admin Panel', 'gray', 10),
  ('source', 'After Sales', 'amber', 20),
  ('product', 'ONLINE ORDER', 'green', 10),
  ('perihal', 'Follow Up', 'blue', 10)
on conflict do nothing;

alter table public.online_order_followup_options enable row level security;
alter table public.online_order_followups enable row level security;

drop policy if exists "oo_followup_options_internal_all" on public.online_order_followup_options;
create policy "oo_followup_options_internal_all" on public.online_order_followup_options
  for all using (public.is_internal()) with check (public.is_internal());

drop policy if exists "oo_followups_internal_all" on public.online_order_followups;
create policy "oo_followups_internal_all" on public.online_order_followups
  for all using (public.is_internal()) with check (public.is_internal());

revoke execute on function public.online_order_followups_touch() from public, anon, authenticated;
