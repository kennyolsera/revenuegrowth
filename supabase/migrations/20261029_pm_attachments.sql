-- Project Timeline attachments (ADR-015): real files in a private bucket.
-- Active team members can read and add; nobody deletes or overwrites from the client (keeps Undo working).
insert into storage.buckets (id, name, public, file_size_limit)
values ('pm-attachments', 'pm-attachments', false, 26214400)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists pm_attachments_read on storage.objects;
create policy pm_attachments_read on storage.objects
  for select to authenticated
  using (bucket_id = 'pm-attachments' and public.is_active_member());

drop policy if exists pm_attachments_insert on storage.objects;
create policy pm_attachments_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pm-attachments' and public.is_active_member());
