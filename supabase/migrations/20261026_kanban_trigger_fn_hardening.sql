-- =====================================================================
-- 2026-10-26 · Trigger functions are only meant to run as triggers, never
-- via /rest/v1/rpc (Supabase security advisor 0028/0029). Triggers keep
-- firing for signed-in users; verified on Postgres 16.
-- Run after 20261026_kanban_board.sql and 20261026_kanban_projects.sql.
-- =====================================================================
revoke execute on function public.kanban_tasks_track() from public, anon, authenticated;
revoke execute on function public.kanban_tasks_log_created() from public, anon, authenticated;
revoke execute on function public.kanban_projects_touch() from public, anon, authenticated;
