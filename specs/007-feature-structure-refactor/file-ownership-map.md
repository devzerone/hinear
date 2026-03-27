# File Ownership Map: Feature Structure Refactor

## Issues

| Status | Before | After | Sub-domain | Responsibility |
|---|---|---|---|---|
| moved | `src/features/issues/components/KanbanBoardView.tsx` | `src/features/issues/board/screens/KanbanBoardView.tsx` | `board` | `screen` |
| moved | `src/features/issues/components/KanbanBoard.tsx` | `src/features/issues/board/components/KanbanBoard.tsx` | `board` | `component` |
| moved | `src/features/issues/components/KanbanColumn.tsx` | `src/features/issues/board/components/KanbanColumn.tsx` | `board` | `component` |
| moved | `src/features/issues/components/IssueCard.tsx` | `src/features/issues/board/components/IssueCard.tsx` | `board` | `component` |
| moved | `src/features/issues/components/BatchActionBar.tsx` | `src/features/issues/board/components/BatchActionBar.tsx` | `board` | `component` |
| moved | `src/features/issues/components/issue-detail-screen.tsx` | `src/features/issues/detail/screens/issue-detail-screen.tsx` | `detail` | `screen` |
| moved | `src/features/issues/components/issue-detail-full-page-screen.tsx` | `src/features/issues/detail/screens/issue-detail-full-page-screen.tsx` | `detail` | `screen` |
| moved | `src/features/issues/components/issue-drawer-screen.tsx` | `src/features/issues/detail/screens/issue-drawer-screen.tsx` | `detail` | `screen` |
| moved | `src/features/issues/components/issue-drawer-with-router.tsx` | `src/features/issues/detail/screens/issue-drawer-with-router.tsx` | `detail` | `screen` |
| moved | `src/features/issues/components/mobile-issue-create-screen.tsx` | `src/features/issues/create/screens/mobile-issue-create-screen.tsx` | `create` | `screen` |
| moved | `src/features/issues/components/IssueActivityItem.tsx` | `src/features/issues/detail/components/IssueActivityItem.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssueCommentMeta.tsx` | `src/features/issues/detail/components/IssueCommentMeta.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssueDateMeta.tsx` | `src/features/issues/detail/components/IssueDateMeta.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssueFieldBlock.tsx` | `src/features/issues/detail/components/IssueFieldBlock.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssueIdentifierBadge.tsx` | `src/features/issues/detail/components/IssueIdentifierBadge.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssueMetaRow.tsx` | `src/features/issues/detail/components/IssueMetaRow.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssuePanel.tsx` | `src/features/issues/detail/components/IssuePanel.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssuePriorityBadge.tsx` | `src/features/issues/detail/components/IssuePriorityBadge.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssueSectionHeader.tsx` | `src/features/issues/detail/components/IssueSectionHeader.tsx` | `detail` | `component` |
| moved | `src/features/issues/components/IssueStatusBadge.tsx` | `src/features/issues/detail/components/IssueStatusBadge.tsx` | `detail` | `component` |
| shared | `src/features/issues/components/IssueAssigneePill.tsx` | `src/features/issues/shared/components/IssueAssigneePill.tsx` | `shared` | `shared-component` |
| shared | `src/features/issues/components/IssueEmptyState.tsx` | `src/features/issues/shared/components/IssueEmptyState.tsx` | `shared` | `shared-component` |
| shared | `src/features/issues/components/IssueLabelChip.tsx` | `src/features/issues/shared/components/IssueLabelChip.tsx` | `shared` | `shared-component` |

## Projects

| Status | Before | After | Sub-domain | Responsibility |
|---|---|---|---|---|
| moved | `src/features/projects/components/project-workspace-screen.tsx` | `src/features/projects/workspace/screens/project-workspace-screen.tsx` | `workspace` | `screen` |
| moved | `src/features/projects/components/project-overview-screen.tsx` | `src/features/projects/overview/screens/project-overview-screen.tsx` | `overview` | `screen` |
| moved | `src/features/projects/components/project-settings-screen.tsx` | `src/features/projects/settings/screens/project-settings-screen.tsx` | `settings` | `screen` |
| moved | `src/features/projects/components/project-create-screen.tsx` | `src/features/projects/create/screens/project-create-screen.tsx` | `create` | `screen` |
| moved | `src/features/projects/components/github-integration-settings-card.tsx` | `src/features/projects/settings/components/github-integration-settings-card.tsx` | `settings` | `component` |
| moved | `src/features/projects/components/project-metadata-form.tsx` | `src/features/projects/settings/components/project-metadata-form.tsx` | `settings` | `component` |
| moved | `src/features/projects/components/project-issue-create-panel.tsx` | `src/features/projects/create/components/project-issue-create-panel.tsx` | `create` | `component` |
| shared | `src/features/projects/components/project-modal-provider.tsx` | `src/features/projects/shared/providers/project-modal-provider.tsx` | `shared` | `provider` |
| split-entry | `src/features/projects/components/project-operation-cards.tsx` | `src/features/projects/create/components/project-create-cards.tsx`, `src/features/projects/settings/components/project-access-card.tsx`, `src/features/projects/shared/components/invitation-accept-card.tsx` | `create/settings/shared` | `component` |

## Shared Qualification Notes

- `IssueAssigneePill` is used by board issue cards and detail experiences.
- `IssueEmptyState` is used by multiple detail-related states and empty branches.
- `IssueLabelChip` is used by board cards, detail screens, and overview surfaces.

## Validation Notes

- Route files should import `screens/` entries only.
- Layout-wide modal wiring should import from `shared/providers/`.
- Tests, stories, and browser artifacts move with the owning implementation file.

## Smoke Check Notes

- `pnpm typecheck` passed on 2026-03-27.
- `pnpm lint` passed on 2026-03-27.
- `pnpm test` passed on 2026-03-27 after updating `vitest.config.ts` to exclude the relocated `src/features/issues/board/components/kanban-board.stories.tsx` from the Storybook browser project.
- Manual route pass against a local webpack dev server confirmed:
  - `GET /projects/new` redirected to `/auth?next=%2Fprojects%2Fnew&reason=auth_required`
  - `GET /projects/demo/overview` redirected to `/auth?next=%2F&reason=auth_required`
  - `GET /projects/demo/settings` redirected to `/auth?next=%2F&reason=auth_required`
  - `GET /projects/demo/issues/new` redirected to `/auth?next=%2F&reason=auth_required`
  - `GET /projects/demo/issues/demo-issue` redirected to `/auth?next=%2F&reason=auth_required`
  - `GET /invite/demo-token` rendered the invalid invitation state without import/runtime errors
