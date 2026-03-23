-- Notification preferences table
create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  issue_assigned boolean not null default true,
  issue_status_changed boolean not null default true,
  comment_added boolean not null default true,
  project_invited boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.notification_preferences enable row level security;

-- Users can manage their own preferences
create policy "Users can view own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function public.update_notification_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger notification_preferences_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.update_notification_preferences_updated_at();

-- Function to get default preferences for a user
create or replace function public.get_or_create_notification_preferences(p_user_id uuid)
returns public.notification_preferences
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_preferences public.notification_preferences;
begin
  -- Try to get existing preferences
  select * into v_preferences
  from public.notification_preferences
  where user_id = p_user_id;

  -- If not found, create with defaults
  if not found then
    insert into public.notification_preferences (user_id)
    values (p_user_id)
    returning * into v_preferences;
  end if;

  return v_preferences;
end;
$$;

grant execute on function public.get_or_create_notification_preferences(uuid)
to authenticated;

-- Comment
comment on table public.notification_preferences is 'Stores user notification preferences';
comment on column public.notification_preferences.issue_assigned is 'Receive notifications when assigned to issues';
comment on column public.notification_preferences.issue_status_changed is 'Receive notifications when issue status changes';
comment on column public.notification_preferences.comment_added is 'Receive notifications when comments are added';
comment on column public.notification_preferences.project_invited is 'Receive notifications when invited to projects';
