-- Add due_date column to issues table
alter table public.issues
add column if not exists due_date timestamptz;

-- Add comment
comment on column public.issues.due_date is 'Optional due date for the issue';
