# Button Coverage: Activate Inactive Buttons

## Outcome Vocabulary

| Status | Meaning |
|--------|---------|
| `activated` | The button now navigates, toggles UI, submits data, or closes a surface with an observable result. |
| `intentionally-disabled` | The control stays visible, but it is rendered read-only/disabled with an explicit limitation instead of acting like a clickable no-op. |
| `deferred` | The control is still outside this feature slice and must stay documented with a follow-up reason. |

## Fast Validation Loop

- Run the smallest affected Vitest file first while wiring a button or control.
- Re-run the related feature screen test before moving to the next surface.
- Finish each slice with `pnpm typecheck` and the relevant feature tests before broad validation.

## Async Feedback Expectations

| Flow Type | Pending Feedback | Failure Feedback | Duplicate Protection | Evidence Pattern |
|-----------|------------------|------------------|----------------------|------------------|
| Project settings save | Submit label changes to `Saving project details...` and the button disables while the form is pending. | Section-level error or notice banner remains visible after the response. | Native form submit lock through `useFormStatus` and disabled submit state. | `project-metadata-form.tsx`, `project-settings-screen.tsx`, `project-settings-screen.test.tsx` |
| Project delete | Delete button switches to `Deleting...` and destructive guidance explains that duplicate requests are blocked. | Error banner remains in the settings screen and toast mirrors the failure. | `isDeleting` transition disables the button until the request settles. | `project-settings-screen.tsx`, `project-settings-screen.test.tsx` |
| Project access actions | Invite/resend/revoke/remove labels switch to pending copy such as `Sending invite...` or `Removing...`. | Blocked owner/team requirements stay visible as read-only guidance; action-result notices/errors render in the same section via server action props. | Per-form `useFormStatus` disables the active submit button while the request is pending. | `project-operation-cards.tsx`, `project-operation-cards.test.tsx` |
| Issue create | Submit label changes to `Creating issue...`, close/cancel lock, and inline copy explains that duplicate submits are blocked. | Validation toast or submit failure toast appears before controls recover. | Local `isSubmitting` gate prevents a second submit until the first one settles. | `CreateIssueTabletModal.tsx`, `CreateIssueTabletModal.test.tsx` |
| Board mutation | Inline board notice announces in-flight updates. | Mapped retry toast explains that the board update failed. | `pendingIssueIds` blocks duplicate updates for the same issue. | `KanbanBoardView.tsx`, `useIssues.ts`, related tests |
| Drawer/full-page save or comment | Save/comment buttons disable during request and persistent banners keep the final state visible after completion. | Toast and inline error banner both stay aligned with the mapped mutation message. | Shared `isSaving` transition blocks repeat requests until the active mutation settles. | `issue-drawer-screen.tsx`, `issue-detail-full-page-screen.tsx`, related tests |

## Current In-Scope Inventory

| Button | Screen | Status | Result or Limitation | Evidence | Follow-up |
|--------|--------|--------|----------------------|----------|-----------|
| `General` | `project-settings-screen` | `activated` | Jumps to the general settings section and marks the section link as current. | `project-settings-screen.tsx`, `project-settings-screen.test.tsx` | None |
| `Access` | `project-settings-screen` | `activated` | Jumps to the access section instead of acting like a dead tab. | `project-settings-screen.tsx` | None |
| `Members` | `project-settings-screen` | `activated` | Jumps to the member roster section instead of acting like a dead tab. | `project-settings-screen.tsx`, `project-operation-cards.tsx` | None |
| `Danger zone` | `project-settings-screen` | `activated` | Jumps to the destructive/integration area so the target is explicit. | `project-settings-screen.tsx`, `github-integration-settings-card.tsx` | None |
| `Issues` | desktop sidebar | `activated` | Opens the full project board without a status filter. | `project-workspace-screen.tsx`, `project-settings-screen.tsx` | None |
| `Triage` | desktop sidebar | `activated` | Opens the board filtered to `Triage` issues through URL query state. | `project-workspace-screen.tsx`, `project-settings-screen.tsx`, `project-workspace-screen.test.tsx` | None |
| `Active` | desktop sidebar | `activated` | Opens the board filtered to `In Progress` issues through URL query state. | `project-workspace-screen.tsx`, `project-settings-screen.tsx`, `project-workspace-screen.test.tsx` | None |
| `Backlog` | desktop sidebar | `activated` | Opens the board filtered to `Backlog` issues through URL query state. | `project-workspace-screen.tsx`, `project-settings-screen.tsx`, `project-workspace-screen.test.tsx` | None |
| `Roadmap` | desktop sidebar primitive | `deferred` | No shipped roadmap screen exists in this slice, so the shared primitive must keep it explicitly unavailable instead of faking navigation. | `SidebarItem.tsx` | Add a real roadmap destination before enabling |
| `New issue` | `KanbanBoardView` desktop/mobile header | `activated` | Opens the inline create modal when an action is wired, otherwise routes to the dedicated create page so the button never dead-ends. | `KanbanBoardView.tsx`, `KanbanBoardView.test.tsx` | Standardize pending/success feedback in US2 |
| `Filter` / mobile search | `KanbanBoardView` header actions | `activated` | Toggles the shared filter panel and now keeps supporting guidance visible even when filters are collapsed. | `KanbanBoardView.tsx`, `KanbanBoardView.test.tsx` | None |
| Board status change drag/drop | `KanbanBoardView` / `useIssues` | `activated` | While a card update is in flight, the board shows a pending notice, duplicate updates for the same issue are blocked, and failed updates still raise the mapped retry toast. | `KanbanBoardView.tsx`, `KanbanBoardView.test.tsx`, `useIssues.ts`, `useIssues.test.tsx` | Extend the same pending/recovery language to drawer and full-page issue actions in US2 |
| `Save project details` | `project-metadata-form` | `activated` when submit wiring exists, `intentionally-disabled` when `action` is absent | Save now switches to `Saving project details...` while the server action is pending, keeps blocked guidance visible when no action is wired, and relies on the section notice/error banner for the final result. | `project-metadata-form.tsx`, `project-settings-screen.tsx`, `project-settings-screen.test.tsx` | None |
| `Delete this project` | `project-settings-screen` | `activated` | Delete now keeps success/failure guidance visible in the settings panel in addition to the toast, and explains that duplicate delete requests stay blocked while the request is pending. | `project-settings-screen.tsx`, `project-settings-screen.test.tsx` | None |
| `Connect Repository` | `github-integration-settings-card` | `activated` when a repository is selected, `intentionally-disabled` before selection | The repository CTA stays disabled until a real repository is chosen, and the card now explains how to unblock the action instead of leaving a silent disabled button. | `github-integration-settings-card.tsx`, `github-integration-settings-card.test.tsx` | None |
| `Disconnect Repository` | `github-integration-settings-card` | `activated` | Disconnect now keeps duplicate requests blocked while pending and explains the consequence of disconnecting automation for the project. | `github-integration-settings-card.tsx`, `github-integration-settings-card.test.tsx` | None |
| `Send invite` | `project-operation-cards` | `intentionally-disabled` when invite action is absent or role is blocked | Invitation controls explain blocked owner/team requirements instead of silently failing. | `project-operation-cards.tsx` | Add explicit owner feedback assertions |
| `Send invite` / `Resend` / `Revoke` | `project-operation-cards` | `activated` when action wiring exists, `intentionally-disabled` when actions are absent or role is blocked | Access-management forms now switch to pending labels like `Sending invite...`, `Resending...`, and `Revoking...`, while still keeping owner-only blocked guidance visible when the viewer cannot act. | `project-operation-cards.tsx`, `project-operation-cards.test.tsx` | Add end-to-end result coverage for server-action notice/error messages if needed |
| `Remove` | `project-operation-cards` | `activated` when action wiring exists, `intentionally-disabled` when action is absent | Member removal now exposes a pending `Removing...` state instead of looking idle during the request. | `project-operation-cards.tsx`, `project-operation-cards.test.tsx` | Add end-to-end member-removal notice/error coverage if needed |
| `HeaderAction` controls | reusable header action primitive | `intentionally-disabled` when no `href`, handler, or submit/reset behavior exists | Shared action primitive now prevents active-looking no-op buttons. | `HeaderAction.tsx`, `HeaderAction.test.tsx` | Audit remaining consumers |
| `SidebarItem` controls | reusable sidebar action primitive | `intentionally-disabled` when no `href`, handler, or submit/reset behavior exists | Shared sidebar primitive now prevents clickable-looking dead items. | `SidebarItem.tsx`, `SidebarItem.test.tsx` | Audit remaining consumers |
| `Create issue` modal close/cancel/submit | `CreateIssueTabletModal` | `activated` when submit wiring exists, `intentionally-disabled` when handlers/actions are absent | Title validation blocks empty submits, in-flight creation swaps the CTA to `Creating issue...`, duplicate submits are blocked, and failed client-side submit handlers surface an explicit retry toast before controls recover. | `CreateIssueTabletModal.tsx`, `CreateIssueTabletModal.test.tsx` | Align server-action success confirmation with the rest of the issue flows in US2 |
| `Open full page to comment` | `issue-drawer-screen` | `activated` | Drawer now exposes an explicit comment path instead of leaving comment behavior implicit. | `issue-drawer-screen.tsx`, `issue-drawer-screen.test.tsx` | None |
| `Save changes` | `issue-drawer-screen` | `activated` | Drawer save now keeps a visible success or failure banner in addition to the toast, so retry guidance stays on screen after the request settles. | `issue-drawer-screen.tsx`, `issue-drawer-screen.test.tsx` | None |
| `Save changes` | `issue-detail-full-page-screen` | `activated` | Full-page save now mirrors the issue feedback contract with persistent success/error banners plus the existing toast. | `issue-detail-full-page-screen.tsx`, `issue-detail-full-page-screen.test.tsx` | None |
| `Post comment` | `issue-detail-full-page-screen` | `activated` | Full-page comment composer explains where updates go, only enables submit when content exists, and now keeps retry/success feedback visible after the request completes. | `issue-detail-full-page-screen.tsx`, `issue-detail-full-page-screen.test.tsx` | None |
| `Delete this issue` | `issue-detail-full-page-screen` | `activated` | Danger zone now explains that deletion removes the issue from the board and closes detail after confirmation. | `issue-detail-full-page-screen.tsx` | Add delete regression test if needed |
