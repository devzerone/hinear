-- Allow project owners to delete their own projects

create policy "projects_delete_for_owner"
  on public.projects
  for delete
  using (created_by = (select auth.uid()) or public.is_project_owner(id));
