# Tasks: Feature Structure Refactor

**Input**: Design documents from `/specs/007-feature-structure-refactor/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include targeted test updates and validation tasks because the plan requires preserving behavior and validating the refactor with typecheck, lint, and test coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `src/app/` contains Next.js App Router entries and `src/features/` contains feature modules
- Paths below use repository-root-relative paths from the current Next.js application

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the repository for a safe structural refactor and capture the before/after map reviewers will need.

- [X] T001 Record the initial route-to-screen import map for `src/app/projects/[projectId]/page.tsx`, `src/app/projects/[projectId]/overview/page.tsx`, `src/app/projects/[projectId]/settings/page.tsx`, `src/app/projects/[projectId]/issues/[issueId]/page.tsx`, `src/app/projects/new/page.tsx`, `src/app/projects/[projectId]/layout.tsx`, and `src/app/invite/[token]/page.tsx`
- [X] T002 Create the target sub-domain folders under `src/features/issues/{board,detail,create,shared}` and `src/features/projects/{workspace,overview,settings,create,shared}`
- [X] T003 [P] Create a migration inventory document with before/after ownership for moved files in `specs/007-feature-structure-refactor/file-ownership-map.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared folder rules and cross-cutting moves that all story-specific refactors depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Encode the destination folder and import-boundary rules in `specs/007-feature-structure-refactor/contracts/folder-structure.md` and `specs/007-feature-structure-refactor/contracts/import-boundaries.md` based on the final live file map
- [X] T005 [P] Audit `src/features/issues/components/` and record which files qualify for `src/features/issues/shared/components/` based on proven multi-sub-domain reuse in `specs/007-feature-structure-refactor/file-ownership-map.md`
- [X] T006 [P] Move `src/features/projects/components/project-modal-provider.tsx` into `src/features/projects/shared/providers/project-modal-provider.tsx` and update its colocated consumers if needed
- [X] T007 Remove or reduce the broad issue component barrel in `src/features/issues/components/index.ts` so it no longer re-flattens sub-domain ownership

**Checkpoint**: Shared structure, explicit boundaries, and cross-cutting shared files are ready for story-specific moves.

---

## Phase 3: User Story 1 - Find the Right File Faster (Priority: P1) 🎯 MVP

**Goal**: Reorganize the issue and project route-entry screens into explicit sub-domains so developers can locate board, detail, workspace, overview, settings, and creation flows from folder names alone.

**Independent Test**: A developer can locate the main issue board, issue detail, project workspace, project overview, project settings, and project creation screen files within 30 seconds by inspecting `src/features/issues/` and `src/features/projects/`.

### Tests for User Story 1

- [X] T008 [P] [US1] Update the route-facing screen tests for moved issue screens in `src/features/issues/board/screens/KanbanBoardView.test.tsx`, `src/features/issues/detail/screens/issue-detail-screen.test.tsx`, `src/features/issues/detail/screens/issue-detail-full-page-screen.test.tsx`, `src/features/issues/detail/screens/issue-drawer-screen.test.tsx`, and `src/features/issues/create/screens/mobile-issue-create-screen.test.tsx`
- [X] T009 [P] [US1] Update the route-facing screen tests for moved project screens in `src/features/projects/workspace/screens/project-workspace-screen.test.tsx`, `src/features/projects/overview/screens/project-overview-screen.test.tsx`, `src/features/projects/settings/screens/project-settings-screen.test.tsx`, and `src/features/projects/create/screens/project-create-screen.test.tsx`

### Implementation for User Story 1

- [X] T010 [P] [US1] Move issue route-entry screens from `src/features/issues/components/` into `src/features/issues/board/screens/KanbanBoardView.tsx`, `src/features/issues/detail/screens/issue-detail-screen.tsx`, `src/features/issues/detail/screens/issue-detail-full-page-screen.tsx`, `src/features/issues/detail/screens/issue-drawer-screen.tsx`, `src/features/issues/detail/screens/issue-drawer-with-router.tsx`, and `src/features/issues/create/screens/mobile-issue-create-screen.tsx`
- [X] T011 [P] [US1] Move project route-entry screens from `src/features/projects/components/` into `src/features/projects/workspace/screens/project-workspace-screen.tsx`, `src/features/projects/overview/screens/project-overview-screen.tsx`, `src/features/projects/settings/screens/project-settings-screen.tsx`, and `src/features/projects/create/screens/project-create-screen.tsx`
- [X] T012 [US1] Rewrite route imports to the new screen/provider entries in `src/app/projects/[projectId]/page.tsx`, `src/app/projects/[projectId]/overview/page.tsx`, `src/app/projects/[projectId]/settings/page.tsx`, `src/app/projects/[projectId]/issues/[issueId]/page.tsx`, `src/app/projects/[projectId]/issues/new/page.tsx`, `src/app/projects/new/page.tsx`, and `src/app/projects/[projectId]/layout.tsx`
- [X] T013 [US1] Update issue route-adjacent references to the moved detail screen entries in `src/app/projects/[projectId]/issues/[issueId]/error.tsx`, `src/app/projects/[projectId]/issues/[issueId]/loading.tsx`, and `src/app/projects/[projectId]/issues/[issueId]/not-found.tsx`
- [X] T014 [US1] Update feature-level exports and any direct imports that still point at old flat screen paths in `src/features/issues/index.ts` and `src/features/projects/`

**Checkpoint**: Route-entry screens live under clear sub-domain `screens/` folders and the App Router imports only those explicit entries.

---

## Phase 4: User Story 2 - Understand Component Responsibility (Priority: P2)

**Goal**: Separate screen orchestration from supporting UI so cards, forms, panels, and other reusable pieces have one obvious home per sub-domain.

**Independent Test**: A reviewer can open each sub-domain folder and distinguish screen-level entry files from supporting UI by folder location alone, with mixed-responsibility files either split or documented as shared exceptions.

### Tests for User Story 2

- [X] T015 [P] [US2] Move and fix issue component stories/tests alongside their owners in `src/features/issues/board/components/`, `src/features/issues/detail/components/`, and `src/features/issues/shared/components/`, including `kanban-board.stories.tsx`, `kanban-column.stories.tsx`, `BatchActionBar.test.tsx`, and `IssueCard.test.tsx`
- [X] T016 [P] [US2] Move and fix project supporting UI tests alongside their owners in `src/features/projects/settings/components/github-integration-settings-card.test.tsx` and `src/features/projects/create/components/project-operation-cards.test.tsx`

### Implementation for User Story 2

- [X] T017 [P] [US2] Move issue board-specific supporting UI from `src/features/issues/components/` into `src/features/issues/board/components/`, including `KanbanBoard.tsx`, `KanbanColumn.tsx`, `IssueCard.tsx`, and `BatchActionBar.tsx`
- [X] T018 [P] [US2] Move issue detail-specific supporting UI from `src/features/issues/components/` into `src/features/issues/detail/components/`, including `IssueActivityItem.tsx`, `IssueCommentMeta.tsx`, `IssueDateMeta.tsx`, `IssueFieldBlock.tsx`, `IssueIdentifierBadge.tsx`, `IssueMetaRow.tsx`, `IssuePanel.tsx`, `IssuePriorityBadge.tsx`, `IssueSectionHeader.tsx`, and `IssueStatusBadge.tsx`
- [X] T019 [P] [US2] Move only verified cross-flow issue support UI from `src/features/issues/components/` into `src/features/issues/shared/components/`, including `IssueAssigneePill.tsx`, `IssueEmptyState.tsx`, and `IssueLabelChip.tsx` only if their multi-screen reuse is confirmed in `specs/007-feature-structure-refactor/file-ownership-map.md`
- [X] T020 [P] [US2] Move project settings-specific supporting UI from `src/features/projects/components/` into `src/features/projects/settings/components/`, including `project-metadata-form.tsx` and `github-integration-settings-card.tsx`
- [X] T021 [P] [US2] Split the mixed-responsibility invite/create/settings UI in `src/features/projects/components/project-operation-cards.tsx` into sub-domain-owned files under `src/features/projects/create/components/`, `src/features/projects/settings/components/`, and any invite-specific entry used by `src/app/invite/[token]/page.tsx`
- [X] T022 [US2] Update screen-to-component imports across `src/features/issues/{board,detail,create}/screens/` and `src/features/projects/{workspace,overview,settings,create}/screens/` to consume local components or explicit shared entries only
- [X] T023 [US2] Rewrite the invite flow to use the new project component ownership in `src/app/invite/[token]/page.tsx`

**Checkpoint**: Screen files orchestrate only their flow, supporting UI is colocated under the owning sub-domain, and ambiguous files have been split or intentionally shared.

---

## Phase 5: User Story 3 - Refactor Without Behavior Change (Priority: P3)

**Goal**: Prove the structural refactor preserves the existing product behavior and leaves no broken imports, orphaned tests, or stale file references behind.

**Independent Test**: Run the repository validation commands and perform the documented smoke checks for project workspace, project settings, issue board, issue detail, and invitation flows with the reorganized file tree.

### Tests for User Story 3

- [X] T024 [P] [US3] Update the disabled browser artifact owner path for issue detail in `src/features/issues/detail/screens/issue-detail-screen.browser.test.tsx.disabled` and `src/features/issues/detail/screens/__screenshots__/`
- [X] T025 [P] [US3] Add or refresh focused regression coverage for screen import stability in `src/features/issues/board/screens/KanbanBoardView.test.tsx`, `src/features/issues/detail/screens/issue-detail-screen.test.tsx`, `src/features/projects/workspace/screens/project-workspace-screen.test.tsx`, and `src/features/projects/settings/screens/project-settings-screen.test.tsx`

### Implementation for User Story 3

- [X] T026 [US3] Remove stale flat-component imports, dead re-exports, and orphaned paths across `src/features/issues/`, `src/features/projects/`, and `src/app/projects/`
- [X] T027 [US3] Update the contributor migration and verification guidance in `specs/007-feature-structure-refactor/quickstart.md` and `specs/007-feature-structure-refactor/file-ownership-map.md` to match the shipped folder layout
- [X] T028 [US3] Run `pnpm typecheck`, `pnpm lint`, and `pnpm test` from `/home/choiho/zerone/hinear` and resolve any failures caused by moved files or rewritten imports
- [X] T029 [US3] Perform the final smoke-check pass against `src/app/projects/[projectId]/page.tsx`, `src/app/projects/[projectId]/overview/page.tsx`, `src/app/projects/[projectId]/settings/page.tsx`, `src/app/projects/[projectId]/issues/[issueId]/page.tsx`, `src/app/projects/[projectId]/issues/new/page.tsx`, and `src/app/invite/[token]/page.tsx`

**Checkpoint**: The refactor ships with unchanged behavior, clean imports, colocated tests/artifacts, and a documented migration path for future contributors.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup that spans multiple stories after the structure is stable.

- [X] T030 [P] Delete emptied legacy folders and leftover flat files from `src/features/issues/components/` and `src/features/projects/components/` once all imports are migrated
- [X] T031 [P] Normalize naming and lightweight sub-domain export surfaces in `src/features/issues/` and `src/features/projects/` so new files follow the same responsibility rules
- [X] T032 Run the full quickstart validation checklist in `specs/007-feature-structure-refactor/quickstart.md` and capture any follow-up notes in `specs/007-feature-structure-refactor/file-ownership-map.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on T001-T003; blocks all story work because it establishes the shared structure and boundary rules.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on T010-T014 because supporting UI should move after the screen destinations exist.
- **User Story 3 (Phase 5)**: Depends on T015-T023 because validation must run on the final moved structure.
- **Polish (Phase 6)**: Depends on all selected user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after foundational work and is the MVP because it delivers the main discoverability improvement through screen placement and route import cleanup.
- **User Story 2 (P2)**: Builds on US1 by organizing supporting UI beneath the already-moved screen entries.
- **User Story 3 (P3)**: Verifies the completed refactor and can only finish once US1 and US2 land.

### Within Each User Story

- Update or move existing tests/stories before or alongside implementation moves so coverage follows the owner file.
- Move implementation files before rewriting downstream imports.
- Rewrite route and feature imports before deleting any legacy flat files.
- Complete validation before closing the story.

### Parallel Opportunities

- T003 can run while T001-T002 are being completed.
- T005-T007 can run in parallel after T004 defines the final boundaries.
- T008 and T009 can run in parallel, as can T010 and T011.
- T015 and T016 can run in parallel, as can T017-T021 because they target different file groups.
- T024 and T025 can run in parallel before the final validation pass.
- T030 and T031 can run in parallel after the behavior-preservation checks pass.

---

## Parallel Example: User Story 1

```bash
# Move issue and project screen tests in parallel:
Task: "Update the route-facing screen tests for moved issue screens in src/features/issues/board/screens/KanbanBoardView.test.tsx, src/features/issues/detail/screens/issue-detail-screen.test.tsx, src/features/issues/detail/screens/issue-detail-full-page-screen.test.tsx, src/features/issues/detail/screens/issue-drawer-screen.test.tsx, and src/features/issues/create/screens/mobile-issue-create-screen.test.tsx"
Task: "Update the route-facing screen tests for moved project screens in src/features/projects/workspace/screens/project-workspace-screen.test.tsx, src/features/projects/overview/screens/project-overview-screen.test.tsx, src/features/projects/settings/screens/project-settings-screen.test.tsx, and src/features/projects/create/screens/project-create-screen.test.tsx"

# Move issue and project route-entry screens in parallel:
Task: "Move issue route-entry screens from src/features/issues/components/ into src/features/issues/board/screens/KanbanBoardView.tsx, src/features/issues/detail/screens/issue-detail-screen.tsx, src/features/issues/detail/screens/issue-detail-full-page-screen.tsx, src/features/issues/detail/screens/issue-drawer-screen.tsx, src/features/issues/detail/screens/issue-drawer-with-router.tsx, and src/features/issues/create/screens/mobile-issue-create-screen.tsx"
Task: "Move project route-entry screens from src/features/projects/components/ into src/features/projects/workspace/screens/project-workspace-screen.tsx, src/features/projects/overview/screens/project-overview-screen.tsx, src/features/projects/settings/screens/project-settings-screen.tsx, and src/features/projects/create/screens/project-create-screen.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Move issue and project supporting UI in parallel:
Task: "Move issue board-specific supporting UI from src/features/issues/components/ into src/features/issues/board/components/, including KanbanBoard.tsx, KanbanColumn.tsx, IssueCard.tsx, and BatchActionBar.tsx"
Task: "Move project settings-specific supporting UI from src/features/projects/components/ into src/features/projects/settings/components/, including project-metadata-form.tsx and github-integration-settings-card.tsx"

# Run mixed-responsibility cleanup separately:
Task: "Split the mixed-responsibility invite/create/settings UI in src/features/projects/components/project-operation-cards.tsx into sub-domain-owned files under src/features/projects/create/components/, src/features/projects/settings/components/, and any invite-specific entry used by src/app/invite/[token]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate that route-entry screens and App Router imports now reflect the new sub-domain structure.
5. Pause for review before moving deeper supporting UI if we want the smallest safe milestone.

### Incremental Delivery

1. Ship US1 to lock in screen discoverability and explicit route imports.
2. Ship US2 to finish responsibility separation and mixed-file cleanup.
3. Ship US3 plus Phase 6 to prove behavior parity, remove leftovers, and finalize contributor guidance.
