# Quickstart: Feature Structure Refactor

## Goal

`issues`와 `projects` feature의 flat UI 구조를 sub-domain 중심으로 재배치하고, screen-level entry와 supporting UI를 분리하면서도 동작은 바꾸지 않는다.

## 1. Prepare the workspace

```bash
cd /home/choiho/zerone/hinear
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

기준선에서 확인할 것:

- `src/app/projects/[projectId]`, `overview`, `settings`, `issues/[issueId]`, `issues/new`, `projects/new`, `invite/[token]`가 현재 어떤 feature screen 또는 shared entry를 import하는지 기록한다.
- `src/features/issues/`와 `src/features/projects/` 안에서 screen 파일과 supporting UI를 구분한다.
- mixed-responsibility file 후보(`project-operation-cards.tsx`, `project-modal-provider.tsx`)를 먼저 표시한다.

## 2. Create the target folders first

먼저 implementation을 옮기기 전에 빈 target 구조를 만든다.

권장 target:

```text
src/features/issues/
  board/{components,screens}
  detail/{components,screens}
  create/{screens}
  shared/components

src/features/projects/
  workspace/{components,screens}
  overview/screens
  settings/{components,screens}
  create/{components,screens}
  shared/{components,providers}
```

규칙:

- route entry 또는 route-like orchestrator는 `screens/`
- smaller reusable UI는 `components/`
- layout-wide provider나 cross-screen modal wiring은 `shared/providers`
- 실제 cross-subdomain reuse가 확인되지 않으면 `shared`로 올리지 않는다

## 3. Move in this order

### Stage A: Route-facing screens

우선 route file이 참조하는 screen entry를 새 위치로 옮긴다.

대상 예시:

- `ProjectWorkspaceScreen`
- `ProjectOverviewScreen`
- `ProjectSettingsScreen`
- `ProjectCreateScreen`
- `IssueDetailFullPageScreen`
- `IssueDetailDrawerScreen`
- `IssueDetailScreen`
- `KanbanBoardView`
- `MobileIssueCreateScreen`

검증:

```bash
pnpm typecheck
```

### Stage B: Supporting UI and colocated tests

각 screen이 의존하는 supporting UI와 `.test.tsx` / `.stories.tsx`를 owner와 함께 옮긴다.

주의 대상:

- `project-operation-cards.tsx`는 create/settings/invite 책임이 섞여 있으므로 이동 전에 분리 규칙을 먼저 정한다.
- `project-modal-provider.tsx`는 `src/app/projects/[projectId]/layout.tsx`에서 사용되므로 `shared/providers`로 두는 편이 안전하다.
- `issue-detail-screen.browser.test.tsx.disabled`와 screenshot artifact도 owner 기준으로 함께 정리한다.

검증:

```bash
pnpm test -- --runInBand
```

필요 시 빠른 루프:

```bash
pnpm test src/features/projects/workspace/screens/project-workspace-screen.test.tsx src/features/projects/settings/screens/project-settings-screen.test.tsx src/features/issues/detail/screens/issue-detail-screen.test.tsx src/features/issues/board/screens/KanbanBoardView.test.tsx --run
```

### Stage C: Route import cleanup and boundary enforcement

`src/app` route imports를 새 `screens/` 경로로 바꾸고, broad component barrel이 새 flat layer를 만들지 않도록 정리한다.

확인 대상:

- `src/app/projects/new/page.tsx`
- `src/app/projects/[projectId]/page.tsx`
- `src/app/projects/[projectId]/overview/page.tsx`
- `src/app/projects/[projectId]/settings/page.tsx`
- `src/app/projects/[projectId]/issues/[issueId]/page.tsx`
- `src/app/projects/[projectId]/issues/new/page.tsx`
- `src/app/projects/[projectId]/layout.tsx`
- `src/app/invite/[token]/page.tsx`

검증:

```bash
pnpm typecheck
pnpm lint
```

## 4. Final validation

최종 command set:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

수동 smoke checks:

1. `/projects/[projectId]` board/workspace 진입이 기존과 동일하게 동작한다.
2. `/projects/[projectId]/overview` overview 화면이 정상 표시된다.
3. `/projects/[projectId]/settings` 설정 저장/초대/멤버 관리 진입 경로가 유지된다.
4. `/projects/[projectId]/issues/[issueId]` full-page issue detail이 동일하게 열린다.
5. `/projects/[projectId]/issues/new` issue create screen이 새 `create/screens` entry를 통해 정상 동작한다.
6. issue drawer 및 project layout modal wiring이 깨지지 않는다.

## 5. Review checklist

- moved file마다 before/after 경로를 설명할 수 있는가
- screen과 component가 폴더만 보고 구분되는가
- 새 파일을 추가할 때 destination이 하나로 수렴하는가
- route가 leaf component가 아니라 screen entry만 직접 import하는가
- tests/stories가 owner와 함께 이동했는가
- broad barrel export가 다시 flat mental model을 만들지 않는가
