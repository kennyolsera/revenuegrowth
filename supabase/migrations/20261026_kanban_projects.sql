-- =====================================================================
-- 2026-10-26 · Kanban projects + timeline (ADR-005)
-- Additive and idempotent: safe to run more than once. No existing data changes.
-- =====================================================================

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
