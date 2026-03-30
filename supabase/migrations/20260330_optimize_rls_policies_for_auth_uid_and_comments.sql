drop policy if exists profiles_select_for_authenticated_users on public.profiles;
create policy profiles_select_for_authenticated_users
on public.profiles
for select
to authenticated
using (true);

drop policy if exists profiles_insert_for_self on public.profiles;
create policy profiles_insert_for_self
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists profiles_update_for_self on public.profiles;
create policy profiles_update_for_self
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users can view own push subscriptions" on public.push_subscriptions;
create policy "Users can view own push subscriptions"
on public.push_subscriptions
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own push subscriptions" on public.push_subscriptions;
create policy "Users can insert own push subscriptions"
on public.push_subscriptions
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own push subscriptions" on public.push_subscriptions;
create policy "Users can update own push subscriptions"
on public.push_subscriptions
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own push subscriptions" on public.push_subscriptions;
create policy "Users can delete own push subscriptions"
on public.push_subscriptions
for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can view own notification preferences" on public.notification_preferences;
create policy "Users can view own notification preferences"
on public.notification_preferences
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own notification preferences" on public.notification_preferences;
create policy "Users can insert own notification preferences"
on public.notification_preferences
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own notification preferences" on public.notification_preferences;
create policy "Users can update own notification preferences"
on public.notification_preferences
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists comments_update_for_author on public.comments;
create policy comments_update_for_author
on public.comments
for update
to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

drop policy if exists comments_delete_for_author on public.comments;
create policy comments_delete_for_author
on public.comments
for delete
to authenticated
using (author_id = (select auth.uid()));

drop policy if exists comments_insert_for_members on public.comments;
drop policy if exists comments_valid_parent on public.comments;
create policy comments_insert_for_members
on public.comments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.project_members pm
    where pm.project_id = comments.project_id
      and pm.user_id = (select auth.uid())
      and pm.role = any (array['owner'::project_member_role, 'member'::project_member_role])
  )
  and (
    parent_comment_id is null
    or exists (
      select 1
      from public.comments c
      where c.id = comments.parent_comment_id
        and c.issue_id = comments.issue_id
    )
  )
);

drop policy if exists "Users can view own active MCP tokens" on public.mcp_access_tokens;
create policy "Users can view own active MCP tokens"
on public.mcp_access_tokens
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own MCP tokens" on public.mcp_access_tokens;
create policy "Users can insert own MCP tokens"
on public.mcp_access_tokens
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can revoke own MCP tokens" on public.mcp_access_tokens;
create policy "Users can revoke own MCP tokens"
on public.mcp_access_tokens
for update
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Project members can view templates" on public.issue_templates;
create policy "Project members can view templates"
on public.issue_templates
for select
to authenticated
using (
  project_id in (
    select pm.project_id
    from public.project_members pm
    where pm.user_id = (select auth.uid())
  )
);

drop policy if exists "Project owners can create templates" on public.issue_templates;
create policy "Project owners can create templates"
on public.issue_templates
for insert
to authenticated
with check (
  project_id in (
    select pm.project_id
    from public.project_members pm
    where pm.user_id = (select auth.uid())
      and pm.role = 'owner'::project_member_role
  )
);

drop policy if exists "Project owners can update templates" on public.issue_templates;
create policy "Project owners can update templates"
on public.issue_templates
for update
to authenticated
using (
  project_id in (
    select pm.project_id
    from public.project_members pm
    where pm.user_id = (select auth.uid())
      and pm.role = 'owner'::project_member_role
  )
);

drop policy if exists "Project owners can delete templates" on public.issue_templates;
create policy "Project owners can delete templates"
on public.issue_templates
for delete
to authenticated
using (
  project_id in (
    select pm.project_id
    from public.project_members pm
    where pm.user_id = (select auth.uid())
      and pm.role = 'owner'::project_member_role
  )
);
