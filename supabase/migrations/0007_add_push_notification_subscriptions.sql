-- Push notification subscriptions table
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh_key text not null,
  auth_key text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

-- Index for faster lookups by user
create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id)
  where is_active = true;

-- Index for faster lookups by endpoint
create index if not exists push_subscriptions_endpoint_idx
  on public.push_subscriptions(endpoint);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Users can manage their own subscriptions
create policy "Users can view own push subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own push subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own push subscriptions"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own push subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function public.update_push_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row
  execute function public.update_push_subscriptions_updated_at();

-- Comment
comment on table public.push_subscriptions is 'Stores push notification subscriptions for users';
comment on column public.push_subscriptions.user_id is 'Reference to the user profile';
comment on column public.push_subscriptions.endpoint is 'Push subscription endpoint URL';
comment on column public.push_subscriptions.p256dh_key is 'VAPID p256dh key';
comment on column public.push_subscriptions.auth_key is 'VAPID auth key';
comment on column public.push_subscriptions.is_active is 'Whether the subscription is active';
