alter table public.invitations enable row level security;
alter table public.github_integrations enable row level security;

alter function public.update_updated_at_column() set search_path = public;
alter function public.update_baselines_updated_at() set search_path = public;
alter function public.update_push_subscriptions_updated_at() set search_path = public;
alter function public.update_notification_preferences_updated_at() set search_path = public;
alter function public.update_issue_templates_updated_at() set search_path = public;

create index if not exists idx_issue_labels_issue_project
  on public.issue_labels(issue_id, project_id);

drop index if exists public.issue_labels_label_idx;
