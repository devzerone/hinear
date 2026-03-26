-- Add updated_at column to project_invitations table
-- The get_invitation_by_token RPC function returns this column but it was missing

alter table public.project_invitations
  add column updated_at timestamptz not null default timezone('utc', now());

-- Create trigger function to auto-update updated_at (reuse existing if available)
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for project_invitations
create trigger update_project_invitations_updated_at
  before update on public.project_invitations
  for each row
  execute function update_updated_at_column();

-- Add comment
comment on column public.project_invitations.updated_at is 'Last update timestamp, automatically managed';
