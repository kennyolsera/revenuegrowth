-- ADR-016: Activity QRIS (activity_records) and Activity Online Order (online_order_followups):
-- every internal user can view, add and edit; only super_admin can delete.
drop policy if exists activity_records_internal_all on public.activity_records;
drop policy if exists activity_records_select on public.activity_records;
drop policy if exists activity_records_insert on public.activity_records;
drop policy if exists activity_records_update on public.activity_records;
drop policy if exists activity_records_delete on public.activity_records;
create policy activity_records_select on public.activity_records for select using (public.is_internal());
create policy activity_records_insert on public.activity_records for insert with check (public.is_internal());
create policy activity_records_update on public.activity_records for update using (public.is_internal()) with check (public.is_internal());
create policy activity_records_delete on public.activity_records for delete using (public.current_profile_role() = 'super_admin');

drop policy if exists oo_followups_internal_all on public.online_order_followups;
drop policy if exists oo_followups_select on public.online_order_followups;
drop policy if exists oo_followups_insert on public.online_order_followups;
drop policy if exists oo_followups_update on public.online_order_followups;
drop policy if exists oo_followups_delete on public.online_order_followups;
create policy oo_followups_select on public.online_order_followups for select using (public.is_internal());
create policy oo_followups_insert on public.online_order_followups for insert with check (public.is_internal());
create policy oo_followups_update on public.online_order_followups for update using (public.is_internal()) with check (public.is_internal());
create policy oo_followups_delete on public.online_order_followups for delete using (public.current_profile_role() = 'super_admin');
