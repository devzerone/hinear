create index if not exists activity_logs_actor_id_idx
  on public.activity_logs(actor_id);

create index if not exists labels_created_by_idx
  on public.labels(created_by);

create index if not exists project_invitations_invited_by_idx
  on public.project_invitations(invited_by);

create index if not exists project_invitations_accepted_by_idx
  on public.project_invitations(accepted_by);

create index if not exists idx_issue_templates_created_by
  on public.issue_templates(created_by);
