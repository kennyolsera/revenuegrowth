-- =====================================================================
-- 2026-10-26 · Kanban board base tables (schema.sql §13), never applied to the
-- live database before. Additive and idempotent. Must run before
-- 20261026_kanban_projects.sql.
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
