create or replace function public.get_project_board_issues(
  p_project_id uuid
)
returns table (
  id uuid,
  project_id uuid,
  issue_number bigint,
  identifier text,
  title text,
  status text,
  priority text,
  due_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  assignee jsonb,
  labels jsonb
)
language sql
stable
set search_path = public
as $$
  select
    i.id,
    i.project_id,
    i.issue_number,
    i.identifier,
    i.title,
    i.status,
    i.priority,
    i.due_date,
    i.created_at,
    i.updated_at,
    (
      select
        jsonb_build_object(
          'id', p.id,
          'name', coalesce(nullif(trim(p.display_name), ''), p.id::text),
          'avatarUrl', p.avatar_url
        )
      from public.profiles p
      where p.id = i.assignee_id
    ) as assignee,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', l.id,
            'name', l.name,
            'color', l.color
          )
          order by l.name asc
        )
        from public.issue_labels il
        join public.labels l
          on l.id = il.label_id
        where il.project_id = i.project_id
          and il.issue_id = i.id
      ),
      '[]'::jsonb
    ) as labels
  from public.issues i
  where i.project_id = p_project_id
  order by i.issue_number asc;
$$;

grant execute on function public.get_project_board_issues(uuid)
to authenticated;
