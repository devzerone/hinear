# Data Model: Feature Structure Refactor

## Overview

이 기능은 런타임 데이터 모델을 바꾸지 않는다. 대신 파일 재배치와 import 정리를 안전하게 수행하기 위한 구조적 모델을 정의한다. 핵심은 각 파일이 어떤 사용자 흐름과 어떤 책임에 속하는지 명확히 기록하는 것이다.

## Entities

### Feature Area

- **Purpose**: 최상위 제품 기능 경계를 정의한다.
- **Fields**:
  - `id`: `issues`, `projects` 같은 고유 식별자
  - `routeRoots`: 해당 기능이 연결되는 주요 App Router 경로 목록
  - `domainLayers`: 유지해야 하는 루트 레이어 목록 (`actions`, `lib`, `repositories`, `contracts.ts`, `types.ts`, optional `hooks`, `presenters`)
  - `sharedDependencies`: 다른 feature 또는 global component와의 주요 연결점
- **Validation Rules**:
  - 각 Feature Area는 최소 하나의 route root 또는 feature entry를 가져야 한다.
  - 루트 도메인 레이어는 재배치 이후에도 손실되면 안 된다.

### Sub-Domain Group

- **Purpose**: 사용자에게 보이는 흐름 단위로 파일을 묶는다.
- **Fields**:
  - `featureAreaId`: 상위 Feature Area
  - `name`: 예: `board`, `detail`, `workspace`, `settings`
  - `userFlow`: 사용자가 경험하는 주요 흐름 설명
  - `primaryRoutes`: 이 그룹이 주로 연결되는 route 목록
  - `allowedFolders`: `screens`, `components`, `providers`, `stories` 등 허용되는 하위 책임 폴더
- **Validation Rules**:
  - 각 in-scope UI 파일은 정확히 하나의 Sub-Domain Group 또는 `shared` 그룹에 속해야 한다.
  - 그룹 이름만 보고 흐름을 추정할 수 있어야 한다.

### Responsibility Tier

- **Purpose**: 화면 orchestration과 supporting UI를 구분한다.
- **Fields**:
  - `name`: `screen`, `component`, `provider`, `shared-component`
  - `folderName`: 실제 대상 폴더명
  - `definition`: 책임 기준 설명
  - `importConsumers`: 어떤 계층에서 이 tier를 가져다 쓸 수 있는지
- **Validation Rules**:
  - `screen` tier는 route entry 또는 route-like orchestrator여야 한다.
  - `component` tier는 스스로 route data loading 경계를 대표하지 않아야 한다.
  - `provider` tier는 복수 화면 또는 layout에 걸친 상태/overlay orchestration일 때만 허용된다.

### File Ownership Record

- **Purpose**: 개별 파일의 before/after 위치와 소속 규칙을 기록한다.
- **Fields**:
  - `currentPath`: 현재 파일 경로
  - `targetPath`: 이동 후 파일 경로
  - `featureAreaId`: 상위 기능 영역
  - `subDomain`: 대상 Sub-Domain Group
  - `responsibilityTier`: 대상 Responsibility Tier
  - `status`: `move`, `stay`, `split`, `shared`
  - `notes`: 예외 규칙 또는 split 이유
- **Validation Rules**:
  - 모든 moved file은 유일한 `targetPath`를 가져야 한다.
  - `status=split` 이면 후속 target file 집합 또는 분리 근거가 있어야 한다.
  - 리뷰어가 before/after를 1:1 또는 1:n으로 추적할 수 있어야 한다.

### Import Boundary Rule

- **Purpose**: 재배치 후 어떤 계층이 어떤 경로를 import할 수 있는지 정의한다.
- **Fields**:
  - `consumer`: 예: `src/app route`, `feature screen`, `feature component`
  - `allowedTargets`: import 가능한 tier 또는 shared 경계
  - `forbiddenTargets`: 직접 참조하면 안 되는 내부 경계
  - `reason`: 규칙의 목적
- **Validation Rules**:
  - `src/app` route는 screen/provider entry만 직접 import해야 한다.
  - sibling sub-domain 간 직접 leaf-component import는 `shared` 또는 명시적 public entry로 승격되지 않으면 피해야 한다.

### Test Placement Rule

- **Purpose**: 테스트, 스토리, browser artifact의 새 위치 규칙을 정의한다.
- **Fields**:
  - `ownerPattern`: 어떤 파일을 기준으로 테스트가 붙는지
  - `artifactKinds`: `unit-test`, `component-test`, `story`, `browser-test-artifact`
  - `placement`: owner와 같은 폴더 또는 인접 폴더 규칙
- **Validation Rules**:
  - moved UI 파일의 테스트는 owner와 함께 이동해야 한다.
  - orphaned test path가 남아서는 안 된다.

## Relationships

- 하나의 **Feature Area**는 여러 **Sub-Domain Group**을 가진다.
- 하나의 **Sub-Domain Group**은 여러 **File Ownership Record**를 가진다.
- 하나의 **File Ownership Record**는 정확히 하나의 **Responsibility Tier**를 가진다.
- 하나의 **Feature Area**는 하나 이상의 **Import Boundary Rule**을 가진다.
- 하나의 **File Ownership Record**는 0개 이상 **Test Placement Rule** 적용 대상이 된다.

## State Transitions

### File Ownership Record

`Inventoried` → `Assigned` → `Moved` → `Validated`

- `Inventoried`: 현재 위치와 역할이 기록된 상태
- `Assigned`: target sub-domain과 tier가 정해진 상태
- `Moved`: 파일/테스트/import가 실제로 옮겨진 상태
- `Validated`: typecheck/lint/test 및 primary-flow smoke check를 통과한 상태

### Mixed-Responsibility File

`Identified` → `Split Planned` → `Split Applied` | `Explicit Shared Exception`

- `Explicit Shared Exception`: `project-modal-provider.tsx`처럼 한 서브도메인에 가두기보다 shared/provider 규칙으로 남기는 상태

## Initial Mapping Notes

- `issues`
  - `KanbanBoardView.tsx` → `board/screen`
  - `issue-detail-screen.tsx`, `issue-detail-full-page-screen.tsx`, `issue-drawer-screen.tsx` → `detail/screen`
  - `KanbanBoard.tsx`, `KanbanColumn.tsx`, `IssueCard.tsx`, `BatchActionBar.tsx` → `board/component`
  - detail meta/panel/badge files → `detail/component` unless cross-flow reuse is proven
  - `mobile-issue-create-screen.tsx` → `create/screen`
- `projects`
  - `project-workspace-screen.tsx` → `workspace/screen`
  - `project-overview-screen.tsx` → `overview/screen`
  - `project-settings-screen.tsx` → `settings/screen`
  - `project-create-screen.tsx` → `create/screen`
  - `project-metadata-form.tsx`, `github-integration-settings-card.tsx` → `settings/component`
  - `project-modal-provider.tsx` → `shared/provider`
  - `project-operation-cards.tsx` → split candidate across `create`, `settings`, and invite-specific entry needs

## Notes for Implementation

- 이번 계획의 중심 산출물은 새로운 DB schema가 아니라 파일 ownership과 import boundary의 명확화다.
- `shared`는 기본값이 아니다. 둘 이상의 sub-domain에서 실제 재사용이 확인될 때만 허용한다.
- route import 안정성이 중요하므로, 이동 순서는 “target folder 생성 → implementation/test 이동 → import rewrite → validation” 순서를 따른다.
