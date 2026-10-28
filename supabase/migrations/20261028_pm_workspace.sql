-- Project Timeline (Gr8r template): one shared JSON document for the whole team.
-- Optimistic concurrency via `version` (the API only updates when the version matches).
create table if not exists public.pm_workspace (
  id text primary key default 'main',
  doc jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.pm_workspace enable row level security;

create or replace function public.is_active_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active);
$$;
revoke all on function public.is_active_member() from public, anon;
grant execute on function public.is_active_member() to authenticated;

create policy pm_ws_select on public.pm_workspace for select to authenticated using (public.is_active_member());
create policy pm_ws_insert on public.pm_workspace for insert to authenticated with check (public.is_active_member());
create policy pm_ws_update on public.pm_workspace for update to authenticated using (public.is_active_member()) with check (public.is_active_member());
