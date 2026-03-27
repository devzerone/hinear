# Tasks: Activate Inactive Buttons

**Input**: Design documents from `/specs/006-activate-buttons/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature requires tests because the spec makes user-story testing mandatory and the constitution enforces TDD for core behavior changes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the feature workspace, validation targets, and documentation scaffolding before implementation begins

- [X] T001 Create the initial button inventory and coverage worksheet in /home/choiho/zerone/hinear/specs/006-activate-buttons/button-coverage.md
- [X] T002 List the current in-scope button targets and expected outcomes from the primary project/issue routes in /home/choiho/zerone/hinear/specs/006-activate-buttons/button-coverage.md
- [X] T003 [P] Add a test execution note for this feature’s fast validation loop to /home/choiho/zerone/hinear/specs/006-activate-buttons/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared interaction rules and reusable behavior that all user stories will rely on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define the shared button outcome states and coverage status vocabulary in /home/choiho/zerone/hinear/specs/006-activate-buttons/button-coverage.md
- [X] T005 [P] Add or refine shared action-state helpers for pending/blocked messaging in /home/choiho/zerone/hinear/src/lib/utils.ts
- [X] T006 [P] Harden reusable action primitives so active-looking controls require a real target or explicit disabled treatment in /home/choiho/zerone/hinear/src/components/molecules/HeaderAction/HeaderAction.tsx
- [X] T007 [P] Harden reusable icon/sidebar action primitives so missing behavior is represented explicitly in /home/choiho/zerone/hinear/src/components/molecules/SidebarItem/SidebarItem.tsx
- [X] T008 [P] Add foundational regression tests for reusable action controls in /home/choiho/zerone/hinear/src/components/molecules/HeaderAction/HeaderAction.test.tsx

**Checkpoint**: Shared interaction rules and reusable action behavior are defined for all stories

---

## Phase 3: User Story 1 - Complete Expected Button Actions (Priority: P1) 🎯 MVP

**Goal**: Make every in-scope visible button on the primary project/issue flows produce a concrete result or explicit limitation

**Independent Test**: 주요 프로젝트/이슈 화면에서 클릭 가능한 버튼을 눌렀을 때, 각 버튼이 명확한 결과를 만들거나 사용할 수 없는 이유를 즉시 알려주면 된다.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] Add project settings interaction tests for section buttons and destructive actions in /home/choiho/zerone/hinear/src/features/projects/components/project-settings-screen.test.tsx
- [X] T010 [P] [US1] Add project workspace interaction tests for board/header/mobile actions in /home/choiho/zerone/hinear/src/features/projects/components/project-workspace-screen.test.tsx
- [X] T011 [P] [US1] Extend issue create modal interaction tests for close/cancel/create flows in /home/choiho/zerone/hinear/src/components/organisms/CreateIssueTabletModal/CreateIssueTabletModal.test.tsx
- [X] T012 [P] [US1] Add issue drawer interaction tests for close/update/comment controls in /home/choiho/zerone/hinear/src/features/issues/components/issue-drawer-screen.test.tsx
- [X] T013 [P] [US1] Add issue detail interaction tests for close/update/comment controls in /home/choiho/zerone/hinear/src/features/issues/components/issue-detail-full-page-screen.test.tsx

### Implementation for User Story 1

- [X] T014 [US1] Implement real section navigation or section switching for `General`, `Access`, `Members`, and `Danger zone` in /home/choiho/zerone/hinear/src/features/projects/components/project-settings-screen.tsx
- [X] T015 [P] [US1] Wire the `General` section target and anchor state in /home/choiho/zerone/hinear/src/features/projects/components/project-metadata-form.tsx
- [X] T016 [P] [US1] Wire the `Access` and `Members` section targets and anchor state in /home/choiho/zerone/hinear/src/features/projects/components/project-operation-cards.tsx
- [X] T017 [P] [US1] Wire the `Danger zone` section target and limitation state in /home/choiho/zerone/hinear/src/features/projects/components/github-integration-settings-card.tsx
- [X] T018 [P] [US1] Ensure project board header and mobile action buttons always navigate or toggle real UI state in /home/choiho/zerone/hinear/src/features/issues/components/KanbanBoardView.tsx
- [X] T019 [P] [US1] Ensure issue drawer controls always close, navigate, or update state explicitly in /home/choiho/zerone/hinear/src/features/issues/components/issue-drawer-screen.tsx
- [X] T020 [P] [US1] Ensure full-page issue detail controls always close, navigate, or update state explicitly in /home/choiho/zerone/hinear/src/features/issues/components/issue-detail-full-page-screen.tsx
- [X] T021 [US1] Normalize inactive or unsupported buttons into explicit disabled/read-only states in /home/choiho/zerone/hinear/src/features/projects/components/github-integration-settings-card.tsx
- [X] T022 [US1] Record the activated, intentionally disabled, and deferred buttons discovered during implementation in /home/choiho/zerone/hinear/specs/006-activate-buttons/button-coverage.md

**Checkpoint**: User Story 1 should now remove no-op buttons from the primary project and issue flows

---

## Phase 4: User Story 2 - Keep Interaction Feedback Consistent (Priority: P2)

**Goal**: Make button outcomes consistently communicate pending, success, failure, and blocked states

**Independent Test**: 각 버튼 동작을 실행했을 때 처리 중 상태, 성공 결과, 실패 안내가 일관되게 보여지면 된다.

### Tests for User Story 2 ⚠️

- [X] T023 [P] [US2] Add project settings feedback tests for save/delete pending and failure states in /home/choiho/zerone/hinear/src/features/projects/components/project-settings-screen.test.tsx
- [X] T024 [P] [US2] Extend issue creation feedback tests for validation, pending, and failure messaging in /home/choiho/zerone/hinear/src/components/organisms/CreateIssueTabletModal/CreateIssueTabletModal.test.tsx
- [X] T025 [P] [US2] Add board mutation feedback tests for issue updates and duplicate-action prevention in /home/choiho/zerone/hinear/src/features/issues/hooks/useIssues.test.tsx
- [X] T026 [P] [US2] Add issue drawer feedback tests for update/comment failure and recovery messaging in /home/choiho/zerone/hinear/src/features/issues/components/issue-drawer-screen.test.tsx
- [X] T027 [P] [US2] Add issue detail feedback tests for comment/update failure and recovery messaging in /home/choiho/zerone/hinear/src/features/issues/components/issue-detail-screen.test.tsx

### Implementation for User Story 2

- [X] T028 [US2] Align project delete and project settings save feedback states in /home/choiho/zerone/hinear/src/features/projects/components/project-settings-screen.tsx
- [X] T029 [P] [US2] Add consistent pending, success, and blocked messaging for project metadata updates in /home/choiho/zerone/hinear/src/features/projects/components/project-metadata-form.tsx
- [X] T030 [P] [US2] Add consistent pending and failure feedback for project access and invitation actions in /home/choiho/zerone/hinear/src/features/projects/components/project-operation-cards.tsx
- [X] T031 [P] [US2] Align issue create feedback and duplicate-submission protection in /home/choiho/zerone/hinear/src/components/organisms/CreateIssueTabletModal/CreateIssueTabletModal.tsx
- [X] T032 [P] [US2] Align board-level issue mutation feedback and retry messaging in /home/choiho/zerone/hinear/src/features/issues/components/KanbanBoardView.tsx
- [X] T033 [P] [US2] Align drawer issue update/comment feedback states in /home/choiho/zerone/hinear/src/features/issues/components/issue-drawer-screen.tsx
- [X] T034 [P] [US2] Align full-page issue update/comment feedback states in /home/choiho/zerone/hinear/src/features/issues/components/issue-detail-full-page-screen.tsx
- [X] T035 [US2] Update the feedback expectations and evidence for each async button flow in /home/choiho/zerone/hinear/specs/006-activate-buttons/button-coverage.md

**Checkpoint**: User Story 2 should now make async button behavior understandable and consistent

---

## Phase 5: User Story 3 - Make Button Coverage Understandable (Priority: P3)

**Goal**: Leave a clear, reviewable record of which buttons were activated, intentionally disabled, or deferred

**Independent Test**: 새 기여자가 문서나 검증 기준만 보고 이번에 활성화된 버튼 범위와 제외 기준을 구분할 수 있으면 된다.

### Tests for User Story 3 ⚠️

- [X] T036 [P] [US3] Add a documentation verification checklist for button coverage completeness in /home/choiho/zerone/hinear/specs/006-activate-buttons/quickstart.md

### Implementation for User Story 3

- [X] T037 [US3] Finalize the per-button coverage table with status, result, evidence, and follow-up fields in /home/choiho/zerone/hinear/specs/006-activate-buttons/button-coverage.md
- [X] T038 [P] [US3] Cross-reference the coverage statuses with the contract exit criteria in /home/choiho/zerone/hinear/specs/006-activate-buttons/contracts/button-interaction-contract.md
- [X] T039 [P] [US3] Update the implementation notes and reviewer walkthrough for this feature in /home/choiho/zerone/hinear/specs/006-activate-buttons/quickstart.md
- [X] T040 [US3] Document the manual 5-second recognition verification steps for success and failure outcomes in /home/choiho/zerone/hinear/specs/006-activate-buttons/quickstart.md
- [X] T041 [US3] Summarize activated versus deferred button scope in /home/choiho/zerone/hinear/specs/006-activate-buttons/plan.md

**Checkpoint**: User Story 3 should now make the feature scope and exclusions obvious to future contributors

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all user stories

- [X] T042 [P] Run targeted primary-flow validation for `/projects/new`, `/projects/[projectId]`, and issue detail flows and record results in /home/choiho/zerone/hinear/specs/006-activate-buttons/quickstart.md
- [X] T043 [P] Run the feature validation command set and record outcomes in /home/choiho/zerone/hinear/specs/006-activate-buttons/quickstart.md
- [X] T044 [P] Verify the final button inventory and evidence links are up to date in /home/choiho/zerone/hinear/specs/006-activate-buttons/button-coverage.md
- [X] T045 Run `pnpm typecheck`, `pnpm lint`, and `pnpm test` from /home/choiho/zerone/hinear and resolve any regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational completion and defines the MVP
- **User Story 2 (P2)**: Depends on US1 button wiring being present so feedback can be standardized on real interactions
- **User Story 3 (P3)**: Depends on US1 and US2 outcomes so the coverage record can reflect final activation and feedback states

### Within Each User Story

- Tests must be written and fail before implementation
- Screen-level wiring before documentation finalization
- Coverage updates happen after each story’s implementation, not only at the end

### Execution Order

T001 → T002 → T003 → T004 → T005/T006/T007/T008 → T009/T010/T011/T012/T013 → T014/T015/T016/T017/T018/T019/T020/T021/T022 → T023/T024/T025/T026/T027 → T028/T029/T030/T031/T032/T033/T034/T035 → T036 → T037/T038/T039/T040/T041 → T042/T043/T044/T045

---

## Parallel Opportunities

### User Story 1

- T009, T010, T011, T012, and T013 can run in parallel because they target separate screens/tests
- T015, T016, T017, T018, T019, T020, and T021 can run in parallel after T014 establishes the settings/navigation baseline

### User Story 2

- T023, T024, T025, T026, and T027 can run in parallel
- T029, T030, T031, T032, T033, and T034 can run in parallel once the shared feedback approach is decided

### User Story 3

- T038 and T039 can run in parallel after T037 creates the final coverage table

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 test tasks in parallel:
Task: "Add project settings interaction tests in /home/choiho/zerone/hinear/src/features/projects/components/project-settings-screen.test.tsx"
Task: "Add project workspace interaction tests in /home/choiho/zerone/hinear/src/features/projects/components/project-workspace-screen.test.tsx"
Task: "Extend issue create modal tests in /home/choiho/zerone/hinear/src/components/organisms/CreateIssueTabletModal/CreateIssueTabletModal.test.tsx"
Task: "Add issue drawer interaction tests in /home/choiho/zerone/hinear/src/features/issues/components/issue-drawer-screen.test.tsx"
Task: "Add issue detail interaction tests in /home/choiho/zerone/hinear/src/features/issues/components/issue-detail-full-page-screen.test.tsx"

# Launch User Story 1 implementation tasks in parallel after settings navigation is decided:
Task: "Wire the `Access` and `Members` section targets in /home/choiho/zerone/hinear/src/features/projects/components/project-operation-cards.tsx"
Task: "Ensure board header/mobile actions behave explicitly in /home/choiho/zerone/hinear/src/features/issues/components/KanbanBoardView.tsx"
Task: "Ensure issue drawer controls behave explicitly in /home/choiho/zerone/hinear/src/features/issues/components/issue-drawer-screen.tsx"
Task: "Ensure full-page issue detail controls behave explicitly in /home/choiho/zerone/hinear/src/features/issues/components/issue-detail-full-page-screen.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch User Story 2 tests in parallel:
Task: "Add project settings feedback tests in /home/choiho/zerone/hinear/src/features/projects/components/project-settings-screen.test.tsx"
Task: "Extend issue creation feedback tests in /home/choiho/zerone/hinear/src/components/organisms/CreateIssueTabletModal/CreateIssueTabletModal.test.tsx"
Task: "Add board mutation feedback tests in /home/choiho/zerone/hinear/src/features/issues/hooks/useIssues.test.tsx"
Task: "Add issue drawer feedback tests in /home/choiho/zerone/hinear/src/features/issues/components/issue-drawer-screen.test.tsx"
Task: "Add issue detail feedback tests in /home/choiho/zerone/hinear/src/features/issues/components/issue-detail-screen.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate that the primary project/issue flows no longer contain no-op buttons

### Incremental Delivery

1. Setup + Foundational create the shared interaction baseline
2. User Story 1 removes broken button paths from the primary flows
3. User Story 2 standardizes async feedback and duplicate-action prevention
4. User Story 3 documents final coverage so future contributors can maintain it

### Suggested MVP Scope

- **MVP**: Phase 1, Phase 2, and Phase 3 (User Story 1)
- This is the smallest slice that satisfies the core user complaint: visible buttons must do something or explain why they cannot

---

## Notes

- All tasks follow the required checklist format with IDs, optional `[P]`, required `[US#]` labels for story tasks, and exact file paths
- User Story tasks are organized for independent validation in priority order
- Tests are included because the feature spec explicitly requires user-story testing and the constitution enforces TDD
