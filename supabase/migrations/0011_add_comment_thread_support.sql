-- Add thread support to comments table
-- This migration enables nested replies and thread management

-- Add updated_at for edit tracking
alter table public.comments
  add column updated_at timestamptz;

-- Add parent_comment_id for nested replies (self-reference)
alter table public.comments
  add column parent_comment_id uuid references public.comments (id) on delete cascade;

-- Add thread_id for grouping all comments in a thread
-- For root comments, this will be null or equal to id
-- For replies, this points to the root comment of the thread
alter table public.comments
  add column thread_id uuid references public.comments (id) on delete cascade;

-- Add index for parent_comment lookups
create index comments_parent_comment_id_idx
  on public.comments (parent_comment_id)
  where parent_comment_id is not null;

-- Add index for thread lookups
create index comments_thread_id_idx
  on public.comments (thread_id)
  where thread_id is not null;

-- Add composite index for issue + thread ordering
create index comments_issue_thread_created_at_idx
  on public.comments (issue_id, thread_id, created_at asc);

-- Update RLS policies to handle thread columns
drop policy if exists "comments_insert_for_members" on public.comments;

create policy "comments_insert_for_members"
  on public.comments
  for insert
  to authenticated
  with check (
    exists(
      select 1 from public.project_members
      where project_members.project_id = comments.project_id
        and project_members.user_id = auth.uid()
        and project_members.role in ('owner', 'member')
    )
  );

-- Add policy to ensure users can only insert with valid parent_comment_id if provided
create policy "comments_valid_parent"
  on public.comments
  for insert
  to authenticated
  with check (
    parent_comment_id is null
    or exists(
      select 1 from public.comments c
      where c.id = comments.parent_comment_id
        and c.issue_id = comments.issue_id
    )
  );

-- Grant select on comments to authenticated users for project member checks
grant select on public.comments to authenticated;
