# Tasks: RESTful API Design

**Input**: Design documents from `/specs/010-restful-api/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: API contract and route tests are required for this feature because the implementation plan commits to integration testing from day one.

**Organization**: Tasks are grouped by user story so each increment can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel when dependencies are already satisfied
- **[Story]**: User story label for story-specific work (`[US1]`, `[US2]`, etc.)
- Every task includes an exact file path

## Path Conventions

- Application routes live under `src/app/`
- Shared API helpers live under `src/app/api/_lib/`
- Domain logic and repositories live under `src/features/`
- Cross-route tests live under `tests/api/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the shared scaffolding needed before route implementation starts.

- [X] T001 Create shared REST response contract definitions in `src/app/api/_lib/contracts.ts`
- [X] T002 [P] Create reusable API route test helpers in `src/test/api-route-helpers.ts`
- [X] T003 [P] Create a server-side project members repository factory in `src/features/project-members/repositories/server-project-members-repository.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared REST helpers and DTO layers that all versioned endpoints depend on.

**⚠️ CRITICAL**: Finish this phase before starting any user story work.

- [X] T004 Update shared success and error response builders for versioned REST payloads in `src/app/api/_lib/response.ts`
- [X] T005 [P] Add structured API error classes and status mapping in `src/app/api/_lib/errors.ts`
- [X] T006 [P] Add request body and query validation helpers in `src/app/api/_lib/validation.ts`
- [X] T007 [P] Add offset and cursor pagination helpers in `src/app/api/_lib/pagination.ts`
- [X] T008 Add authenticated API request helpers in `src/app/api/_lib/auth.ts`
- [X] T009 [P] Extend project REST DTOs in `src/features/projects/contracts.ts`
- [X] T010 [P] Extend issue REST DTOs in `src/features/issues/contracts.ts`
- [X] T011 [P] Extend project member REST DTOs in `src/features/project-members/contracts.ts`

**Checkpoint**: Shared REST infrastructure is ready and user story work can begin.

---

## Phase 3: User Story 1 - Standard Resource Operations (Priority: P1) 🎯 MVP

**Goal**: Deliver predictable CRUD-style project and project-member endpoints under `/api/v1`.

**Independent Test**: Use HTTP route tests and manual requests against `/api/v1/projects` and `/api/v1/projects/{projectId}/members` to verify list, read, create, update, and delete semantics with correct status codes and `Location` headers.

### Tests for User Story 1

- [X] T012 [P] [US1] Add collection route tests for project list and create operations in `src/app/api/v1/projects/route.test.ts`
- [X] T013 [P] [US1] Add item route tests for project get, patch, and delete operations in `src/app/api/v1/projects/[projectId]/route.test.ts`
- [X] T014 [P] [US1] Add member collection route tests for project member list and create operations in `src/app/api/v1/projects/[projectId]/members/route.test.ts`
- [X] T015 [P] [US1] Add member removal route tests in `src/app/api/v1/projects/[projectId]/members/[memberId]/route.test.ts`

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement project list and create handlers in `src/app/api/v1/projects/route.ts`
- [X] T017 [P] [US1] Implement project get, patch, and delete handlers in `src/app/api/v1/projects/[projectId]/route.ts`
- [X] T018 [P] [US1] Implement project member list and create handlers in `src/app/api/v1/projects/[projectId]/members/route.ts`
- [X] T019 [P] [US1] Implement project member delete handler in `src/app/api/v1/projects/[projectId]/members/[memberId]/route.ts`
- [X] T020 [US1] Update project repository methods for REST create, update, delete, and access checks in `src/features/projects/repositories/supabase-projects-repository.ts`
- [X] T021 [US1] Update project member repository methods for add, list, and remove flows in `src/features/project-members/repositories/SupabaseProjectMembersRepository.ts`

**Checkpoint**: User Story 1 is independently usable as an MVP.

---

## Phase 4: User Story 2 - Nested Resource Management (Priority: P2)

**Goal**: Deliver project-scoped issue CRUD endpoints that enforce project ownership and nesting rules.

**Independent Test**: Exercise `/api/v1/projects/{projectId}/issues` and `/api/v1/projects/{projectId}/issues/{issueId}` with valid and invalid project associations, confirming that nested issue operations only work within the correct project.

### Tests for User Story 2

- [X] T022 [P] [US2] Add nested issue collection route tests for list and create operations in `src/app/api/v1/projects/[projectId]/issues/route.test.ts`
- [X] T023 [P] [US2] Add nested issue item route tests for get, patch, and delete operations in `src/app/api/v1/projects/[projectId]/issues/[issueId]/route.test.ts`

### Implementation for User Story 2

- [X] T024 [P] [US2] Implement nested issue list and create handlers in `src/app/api/v1/projects/[projectId]/issues/route.ts`
- [X] T025 [P] [US2] Implement nested issue get, patch, and delete handlers in `src/app/api/v1/projects/[projectId]/issues/[issueId]/route.ts`
- [X] T026 [US2] Extend issue repository support for project-scoped reads and optimistic locking conflicts in `src/features/issues/repositories/supabase-issues-repository.ts`
- [X] T027 [US2] Add REST issue presentation helpers for nested resource responses in `src/features/issues/presenters/issues-api-presenter.ts`

**Checkpoint**: User Stories 1 and 2 both work independently with correct project hierarchy.

---

## Phase 5: User Story 3 - Consistent Error Responses (Priority: P3)

**Goal**: Standardize error payloads, request metadata, and failure handling across all new REST endpoints.

**Independent Test**: Trigger authentication, authorization, validation, not-found, invalid-JSON, and conflict failures on the implemented v1 routes and confirm every error response matches the contract in `contracts/error-responses.md`.

### Tests for User Story 3

- [X] T028 [P] [US3] Add shared REST error contract coverage in `tests/api/error-response-contract.test.ts`
- [X] T029 [P] [US3] Add invalid JSON, validation, and conflict route tests in `src/app/api/v1/projects/[projectId]/issues/[issueId]/route.test.ts`
- [X] T030 [P] [US3] Add unauthorized and forbidden route tests in `src/app/api/v1/projects/[projectId]/members/route.test.ts`

### Implementation for User Story 3

- [X] T031 [US3] Apply structured error responses and request metadata to project routes in `src/app/api/v1/projects/route.ts` and `src/app/api/v1/projects/[projectId]/route.ts`
- [X] T032 [US3] Apply structured error responses and conflict handling to nested issue routes in `src/app/api/v1/projects/[projectId]/issues/route.ts` and `src/app/api/v1/projects/[projectId]/issues/[issueId]/route.ts`
- [X] T033 [US3] Apply authentication and authorization error mapping to member routes in `src/app/api/v1/projects/[projectId]/members/route.ts` and `src/app/api/v1/projects/[projectId]/members/[memberId]/route.ts`

**Checkpoint**: Implemented v1 routes now fail predictably with a single error contract.

---

## Phase 6: User Story 4 - Filtering, Sorting, and Pagination (Priority: P4)

**Goal**: Add collection query capabilities so consumers can page, filter, and sort project and issue results efficiently.

**Independent Test**: Query project and issue collections with combinations of `page`, `limit`, `sort`, `order`, `status`, `priority`, and `cursor`, then verify the returned items and pagination metadata match the contract documents.

### Tests for User Story 4

- [X] T034 [P] [US4] Add project pagination and sorting tests in `src/app/api/v1/projects/route.test.ts`
- [X] T035 [P] [US4] Add issue filtering and cursor pagination tests in `src/app/api/v1/projects/[projectId]/issues/route.test.ts`

### Implementation for User Story 4

- [X] T036 [US4] Implement offset pagination and sort parsing for project collection routes in `src/app/api/v1/projects/route.ts`
- [X] T037 [US4] Extend project query building for REST sort and page parameters in `src/features/projects/lib/project-query-builder.ts`
- [X] T038 [US4] Implement filter parsing and cursor pagination for issue collection routes in `src/app/api/v1/projects/[projectId]/issues/route.ts`
- [X] T039 [US4] Extend issue repository filtering and pagination queries in `src/features/issues/repositories/supabase-issues-repository.ts`

**Checkpoint**: All contract-defined collection query features are available.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation and cross-story verification after all stories are implemented.

- [X] T040 [P] Add a generated OpenAPI source for the v1 REST surface in `specs/010-restful-api/contracts/openapi.yaml`
- [X] T041 [P] Update the quickstart examples to match the implemented REST routes in `specs/010-restful-api/quickstart.md`
- [X] T042 Run end-to-end REST smoke coverage for the documented flows in `tests/api/rest-api-smoke.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies and starts immediately.
- **Phase 2: Foundational** depends on Phase 1 and blocks all user story work.
- **Phase 3: User Story 1** depends on Phase 2 and defines the MVP.
- **Phase 4: User Story 2** depends on Phase 2 and reuses the shared REST foundation.
- **Phase 5: User Story 3** depends on completed route implementations from User Stories 1 and 2.
- **Phase 6: User Story 4** depends on collection endpoints from User Stories 1 and 2.
- **Phase 7: Polish** depends on all selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational and does not depend on other stories.
- **US2 (P2)**: Starts after Foundational and can proceed independently of US1, though it reuses the same shared helpers.
- **US3 (P3)**: Depends on US1 and US2 route surfaces being present.
- **US4 (P4)**: Depends on US1 and US2 collection endpoints being present.

### Within Each User Story

- Route tests must be written before route implementation.
- Route handlers should be implemented before repository or presenter cleanup that depends on route behavior.
- Repository adaptations must land before the story can be considered complete.

---

## Parallel Opportunities

- `T002` and `T003` can run in parallel after `T001`.
- `T005` through `T011` can be split across shared API helpers and domain contracts after `T004`.
- In US1, `T012` through `T015` can run in parallel, then `T016` through `T019` can run in parallel before repository work `T020` and `T021`.
- In US2, `T022` and `T023` can run together, then `T024` and `T025` can run together before `T026` and `T027`.
- In US3, `T028` through `T030` can run in parallel before `T031` through `T033`.
- In US4, `T034` and `T035` can run in parallel before `T036` through `T039`.
- In Polish, `T040` and `T041` can run in parallel before `T042`.

## Parallel Example: User Story 1

```bash
Task: "Add collection route tests for project list and create operations in src/app/api/v1/projects/route.test.ts"
Task: "Add item route tests for project get, patch, and delete operations in src/app/api/v1/projects/[projectId]/route.test.ts"
Task: "Add member collection route tests for project member list and create operations in src/app/api/v1/projects/[projectId]/members/route.test.ts"
Task: "Add member removal route tests in src/app/api/v1/projects/[projectId]/members/[memberId]/route.test.ts"
```

```bash
Task: "Implement project list and create handlers in src/app/api/v1/projects/route.ts"
Task: "Implement project get, patch, and delete handlers in src/app/api/v1/projects/[projectId]/route.ts"
Task: "Implement project member list and create handlers in src/app/api/v1/projects/[projectId]/members/route.ts"
Task: "Implement project member delete handler in src/app/api/v1/projects/[projectId]/members/[memberId]/route.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add nested issue collection route tests for list and create operations in src/app/api/v1/projects/[projectId]/issues/route.test.ts"
Task: "Add nested issue item route tests for get, patch, and delete operations in src/app/api/v1/projects/[projectId]/issues/[issueId]/route.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Add shared REST error contract coverage in tests/api/error-response-contract.test.ts"
Task: "Add invalid JSON, validation, and conflict route tests in src/app/api/v1/projects/[projectId]/issues/[issueId]/route.test.ts"
Task: "Add unauthorized and forbidden route tests in src/app/api/v1/projects/[projectId]/members/route.test.ts"
```

## Parallel Example: User Story 4

```bash
Task: "Add project pagination and sorting tests in src/app/api/v1/projects/route.test.ts"
Task: "Add issue filtering and cursor pagination tests in src/app/api/v1/projects/[projectId]/issues/route.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate project and member CRUD routes before moving on.

### Incremental Delivery

1. Ship US1 once `/api/v1/projects` and `/api/v1/projects/{projectId}/members` are stable.
2. Add US2 to complete project-scoped issue CRUD.
3. Add US3 to normalize all error responses and edge cases.
4. Add US4 to complete collection querying features.
5. Finish with OpenAPI, quickstart alignment, and smoke coverage.

### Parallel Team Strategy

1. One developer can own shared API helpers in Phase 2.
2. After Phase 2, one developer can take project/member routes while another takes nested issue routes.
3. Once route surfaces exist, a third developer can focus on error-contract hardening and pagination behavior.

## Notes

- All tasks use the required checklist format with IDs, optional `[P]`, story labels where required, and explicit file paths.
- Tests are intentionally included because the plan explicitly requires route and contract coverage.
- The task list follows the current repository layout under `src/app/api`, `src/features`, and `tests` instead of the older placeholder paths in `plan.md`.
