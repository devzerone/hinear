insert into public.issue_templates (
  project_id,
  name,
  description,
  title_template,
  default_priority,
  default_description
)
select
  p.id,
  'Bug Report',
  'Report a bug or issue',
  'Bug: {title}',
  'High',
  '## Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to ''...''
2. Click on ''....''
3. Scroll down to ''....''
4. See error

## Expected Behavior
A concise description of what you expected to happen.

## Actual Behavior
A concise description of what actually happened.

## Environment
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 22]'
from public.projects p
where not exists (
  select 1
  from public.issue_templates it
  where it.project_id = p.id
    and it.name = 'Bug Report'
);

insert into public.issue_templates (
  project_id,
  name,
  description,
  title_template,
  default_priority,
  default_description
)
select
  p.id,
  'Feature Request',
  'Request a new feature',
  'Feature: {title}',
  'Medium',
  '## Problem Statement
What problem does this feature solve?

## Proposed Solution
What is your proposed solution?

## Alternatives
What are the alternatives you''ve considered?

## Additional Context
Add any other context or screenshots about the feature request here.'
from public.projects p
where not exists (
  select 1
  from public.issue_templates it
  where it.project_id = p.id
    and it.name = 'Feature Request'
);
