-- =====================================================================
-- 2026-10-26 · Calendar activity types become editable data (ADR-006)
-- Replaces the fixed CHECK on calendar_events.event_type with a table.
-- Idempotent. Existing events keep their type keys.
-- =====================================================================

create table if not exists public.calendar_event_types (
  key text primary key check (key ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  label text not null check (char_length(trim(label)) between 1 and 60),
  color text not null default 'gray'
    check (color in ('blue', 'green', 'amber', 'red', 'violet', 'teal', 'orange', 'rose', 'gray')),
  sort int not null default 100,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_calendar_event_types_label on public.calendar_event_types (lower(trim(label)));

-- The five types that existed before; keys must match existing events.
insert into public.calendar_event_types (key, label, color, sort) values
  ('demo', 'Demo', 'blue', 10),
  ('onboarding', 'Onboarding', 'green', 20),
  ('support', 'Support', 'amber', 30),
  ('internal', 'Internal', 'violet', 40),
  ('lainnya', 'Lainnya', 'gray', 90)
on conflict (key) do nothing;

-- Any event type not in the table yet (defensive) gets a row so the FK can be added.
insert into public.calendar_event_types (key, label)
select distinct e.event_type, initcap(replace(e.event_type, '_', ' '))
from public.calendar_events e
where e.event_type is not null
  and not exists (select 1 from public.calendar_event_types t where t.key = e.event_type)
on conflict do nothing;

alter table public.calendar_events drop constraint if exists calendar_events_event_type_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.calendar_events'::regclass and conname = 'calendar_events_event_type_fkey'
  ) then
    alter table public.calendar_events
      add constraint calendar_events_event_type_fkey
      foreign key (event_type) references public.calendar_event_types (key)
      on update cascade on delete restrict;
  end if;
end $$;

create index if not exists idx_calendar_events_type on public.calendar_events (event_type);

alter table public.calendar_event_types enable row level security;

drop policy if exists "calendar_event_types_internal_all" on public.calendar_event_types;
create policy "calendar_event_types_internal_all" on public.calendar_event_types
  for all using (public.is_internal()) with check (public.is_internal());
