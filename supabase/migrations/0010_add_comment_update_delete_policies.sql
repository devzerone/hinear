-- Add UPDATE and DELETE policies for comments table
-- These allow comment authors to edit and delete their own comments

create policy "comments_update_for_author"
  on public.comments
  for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "comments_delete_for_author"
  on public.comments
  for delete
  using (author_id = auth.uid());
