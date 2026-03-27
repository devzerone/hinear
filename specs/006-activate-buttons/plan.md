# Implementation Plan: Activate Inactive Buttons

**Branch**: `006-activate-buttons` | **Date**: 2026-03-27 | **Spec**: [/home/choiho/zerone/hinear/specs/006-activate-buttons/spec.md](/home/choiho/zerone/hinear/specs/006-activate-buttons/spec.md)
**Input**: Feature specification from `/specs/006-activate-buttons/spec.md`

## Summary

프로젝트 생성, 프로젝트 작업공간, 프로젝트 설정, 이슈 생성 및 이슈 상세의 주요 흐름에서 “눌릴 수 있어 보이지만 실제 결과가 없는” 버튼을 전수 점검하고, 각 버튼을 탐색, 패널 열기, 저장, 상태 전환, 닫기, 혹은 명시적 제한 안내 중 하나의 결과에 연결한다. 구현은 기존 Next.js App Router + feature folder 구조를 유지하면서 버튼 인벤토리 작성, 공통 상호작용 피드백 규칙 정리, 무반응 버튼의 실제 동작 연결 또는 명시적 비활성화, 마지막으로 회귀 테스트와 버튼 범위 문서화를 통해 끝낸다.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js runtime, React 19.2.4  
**Primary Dependencies**: Next.js 16.2.0 (App Router), Supabase, @tanstack/react-query 5.95.2, sonner, lucide-react, Vitest, Testing Library, Biome  
**Storage**: Supabase PostgreSQL for persisted project/issue state, URL query state for drawer/filter interactions, repository-based server actions, spec artifacts in repository files  
**Testing**: `pnpm test`, targeted Vitest component/integration tests, `pnpm typecheck`, `pnpm lint`  
**Target Platform**: Installable web application/PWA for modern desktop and mobile browsers  
**Project Type**: Web application  
**Performance Goals**: Button interactions should produce visible progress or outcome immediately and keep the user within the primary project/issue flow; perceived result or actionable error should be recognizable within 5 seconds per the spec  
**Constraints**: Must preserve project-first boundaries, keep issue workflows primary, avoid introducing service-role shortcuts, reuse existing feature layering, prevent duplicate submissions, and clearly explain blocked conditions instead of silently failing  
**Scale/Scope**: Single Next.js application with project, issue, comments, notification, and settings features; this feature focuses on the highest-frequency project and issue UI surfaces plus the documentation needed to track included and excluded buttons

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Project-First**: PASS. All button activation work stays inside project-scoped routes and permission checks rather than inventing cross-project shortcuts.
- **Issue-Centric Design**: PASS. Priority is placed on project board, issue creation, issue detail, and supporting settings flows that directly unblock issue management.
- **Domain-Driven Design**: PASS. The plan keeps business rules in existing feature actions/lib layers and limits UI work to components that currently expose dead or unclear controls.
- **Incremental Completeness**: PASS. The work can ship in slices by screen group while still making each completed button set independently usable.
- **Test-Driven Development**: PASS WITH ENFORCEMENT. Every newly activated or newly constrained button path needs a failing test or explicit coverage update before the implementation is finalized.
- **Security & Data Integrity**: PASS. Buttons that mutate data continue to route through existing authenticated server actions or protected API endpoints, with blocked states surfaced to the user.
- **Installable PWA**: PASS. Interaction feedback remains browser/PWA-safe and does not rely on non-PWA-only capabilities.
- **Simplicity**: PASS. The preferred fix is to wire existing intent or mark controls explicitly unavailable, not to introduce a new interaction framework.

## Project Structure

### Documentation (this feature)

```text
specs/006-activate-buttons/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── button-coverage.md
├── contracts/
│   └── button-interaction-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── projects/
│   ├── auth/
│   └── api/
├── components/
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── features/
│   ├── issues/
│   ├── projects/
│   ├── project-members/
│   ├── comments/
│   └── notifications/
├── lib/
│   ├── react-query/
│   ├── supabase/
│   └── utils.ts
├── test/
└── mocks/

tests/
├── performance/
├── integration/
├── contract/
└── unit/

specs/
├── issue-detail.contract.ts
└── 006-activate-buttons/
```

**Structure Decision**: Keep the current single Next.js web application layout. The implementation will primarily touch route entry files under `src/app/projects/*`, reusable button-bearing components under `src/components/*`, and project/issue feature components and actions under `src/features/projects/*` and `src/features/issues/*`, with documentation artifacts under `specs/006-activate-buttons/`.

## Phase 0: Research

- Inventory the primary-flow buttons that are visibly interactive today and classify each as already wired, dead/no-op, blocked by missing prerequisite, or intentionally out of scope.
- Confirm the preferred activation strategy for each class of button: route navigation, local state toggle, modal/drawer lifecycle, server action, protected API call, or explicit disabled/read-only treatment.
- Confirm how existing feedback patterns behave across the app today, including `sonner` toasts, inline notices, disabled/pending button states, and URL-driven overlays.
- Identify concrete dead-control candidates already visible in code, including settings section buttons rendered without navigation/handlers and any optional action props that allow active-looking buttons to appear without behavior.
- Define a coverage record format that lets reviewers distinguish activated buttons, intentionally disabled buttons, and deferred follow-up controls.

## Phase 1: Design & Contracts

- Model the button interaction inventory, outcome contract, guard conditions, and coverage record used to implement and review the feature.
- Define a button interaction contract for primary screens so implementation can verify expected result, pending feedback, failure feedback, and out-of-scope labeling consistently.
- Produce a quickstart that tells implementers how to audit screens, wire behavior, and validate the affected flows with targeted tests.
- Update the agent context so later turns know this branch is about button activation and interaction coverage in existing project/issue flows.

## Phase 2: Implementation Planning Approach

- Stage 1: Build the button coverage inventory for `projects/new`, `projects/[projectId]`, `projects/[projectId]/settings`, issue creation, and issue detail surfaces.
- Stage 2: Fix dead navigation and local-state controls first, especially buttons that should route, open/close panels, or switch visible sections.
- Stage 3: Align mutation buttons with a shared feedback contract: pending/disabled during execution, success confirmation through UI refresh or toast, and clear failure guidance.
- Stage 4: Convert controls that are not yet truly supported into explicit disabled/read-only affordances or documented follow-ups so they stop looking broken.
- Stage 5: Add targeted tests and finalize the coverage record so reviewers can see what was activated and what remains deferred.

## Button Coverage Snapshot

### In-Scope Primary Surfaces

- `src/app/projects/new/page.tsx`
- `src/app/projects/[projectId]/page.tsx`
- `src/app/projects/[projectId]/issues/new/page.tsx`
- `src/features/issues/components/KanbanBoardView.tsx`
- `src/features/issues/components/issue-drawer-screen.tsx`
- `src/features/issues/components/issue-detail-full-page-screen.tsx`
- `src/features/projects/components/project-settings-screen.tsx`
- supporting reusable action components such as `HeaderAction`, `MobileIssueListAppBar`, `SidebarItem`, `BoardAddCard`, and settings cards where they drive the above routes

### Known High-Risk Interaction Gaps

- Project settings section tabs currently render as clickable buttons without any navigation or section-switching behavior.
- Any component that accepts optional `onClick`/`href` props for action buttons can accidentally render an active-looking control with no result if the parent omits wiring.
- Mutation paths need consistent pending and failure signaling so “working but unclear” buttons do not regress into perceived dead buttons.
- Unsupported project operations, such as incomplete future actions, must not be exposed as normal clickable controls without a limitation message.

## Post-Design Constitution Check

- **Project-First**: PASS. The design keeps project-scoped route/context ownership intact.
- **Issue-Centric Design**: PASS. The main board, issue create, and issue detail surfaces remain the first-class targets.
- **Domain-Driven Design**: PASS. UI fixes will delegate persistence and validation to existing actions/repositories instead of embedding new business logic in presentation components.
- **Incremental Completeness**: PASS. Screen-by-screen rollout still yields independently testable value.
- **Test-Driven Development**: PASS WITH ENFORCEMENT. The quickstart and contract require targeted tests for activation, blocked-state feedback, and documented exclusions.
- **Security & Data Integrity**: PASS. Authenticated actions and permission-aware API paths remain the only mutation backends.
- **Installable PWA**: PASS. Interaction feedback stays compatible with browser/PWA delivery.
- **Simplicity**: PASS. The plan favors wiring existing intent and clearly disabling unsupported controls over adding new abstractions.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Activated vs Deferred Scope

- Activated in the current slice: project settings section navigation, reusable header/sidebar action hardening, and explicit disabled treatment for settings/invite/modal controls that previously could present as clickable no-ops.
- Deferred to the remaining implementation pass: full async feedback normalization across issue detail, drawer, board mutations, and the final per-screen validation matrix.
