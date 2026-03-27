# Data Model: Activate Inactive Buttons

## Overview

이 기능은 새로운 영속 데이터 테이블을 추가하기보다, 기존 UI 상호작용을 명확하게 구현하고 검증하기 위한 운영 모델을 정의한다. 주요 목적은 “보이는 버튼”과 “실제 결과” 사이의 계약을 분명히 만드는 것이다.

## Entities

### Button Action Target

- **Purpose**: 사용자가 누를 수 있다고 인식하는 개별 컨트롤과 그 기대 결과를 정의한다.
- **Fields**:
  - `id`: 버튼 또는 액션을 식별하는 고유 키
  - `screen`: 버튼이 존재하는 화면 또는 컴포넌트
  - `label`: 사용자에게 보이는 이름 또는 접근성 이름
  - `controlType`: `button`, `link-button`, `icon-button`, `submit-button` 중 하나
  - `intent`: `navigate`, `toggle-ui`, `open-overlay`, `close-overlay`, `submit-mutation`, `explain-limitation`
  - `implementationPath`: 실제 구현이 연결되는 경로 또는 컴포넌트/액션
  - `status`: `activated`, `intentionally-disabled`, `deferred`
  - `scopePriority`: `P1`, `P2`, `P3`
- **Validation Rules**:
  - `label` 또는 접근성 이름이 비어 있을 수 없다.
  - `status=activated` 인 경우 `intent`와 `implementationPath`가 모두 필요하다.
  - `status=intentionally-disabled` 또는 `status=deferred` 인 경우 제한 이유가 Coverage Record에 남아야 한다.

**Initial Instances**:

1. `project-settings-section-general`
   - `screen`: `project-settings-screen`
   - `label`: `General`
   - `controlType`: `button`
   - `intent`: `navigate` or `toggle-ui`
   - `implementationPath`: `src/features/projects/components/project-settings-screen.tsx`
   - `status`: `deferred` at planning time
   - `scopePriority`: `P1`
2. `kanban-new-issue`
   - `screen`: `kanban-board-view`
   - `label`: `New issue`
   - `controlType`: `button`
   - `intent`: `open-overlay`
   - `implementationPath`: `src/features/issues/components/KanbanBoardView.tsx`
   - `status`: `activated`
   - `scopePriority`: `P1`
3. `mobile-issue-search`
   - `screen`: `mobile-issue-list-app-bar`
   - `label`: `Search issues`
   - `controlType`: `icon-button`
   - `intent`: `toggle-ui`
   - `implementationPath`: `src/features/issues/components/KanbanBoardView.tsx`
   - `status`: `activated`
   - `scopePriority`: `P2`

### Interaction Result

- **Purpose**: 버튼 실행 후 사용자가 실제로 인지해야 하는 결과를 정의한다.
- **Fields**:
  - `targetId`: 연결된 `Button Action Target`의 ID
  - `resultType`: `route-change`, `panel-opened`, `panel-closed`, `form-submitted`, `data-updated`, `inline-message`, `toast-message`, `disabled-state`
  - `successSignal`: 사용자가 성공을 판단할 수 있는 UI 증거
  - `pendingSignal`: 처리 중일 때의 버튼/화면 상태
  - `failureSignal`: 실패 또는 제한 시 보여줄 메시지/상태
  - `duplicateProtection`: 중복 실행 방지 방식
- **Validation Rules**:
  - `resultType`는 적어도 하나 있어야 한다.
  - `submit-mutation` 계열 버튼은 `pendingSignal`, `failureSignal`, `duplicateProtection`이 필요하다.
  - `navigate` 계열 버튼은 최종 도착 경로나 열리는 오버레이 상태가 확인 가능해야 한다.

### Guard Condition

- **Purpose**: 버튼이 즉시 실행될 수 없는 경우와 그 이유를 정의한다.
- **Fields**:
  - `targetId`: 연결된 버튼 ID
  - `conditionType`: `missing-input`, `permission`, `unsupported-feature`, `network-error`, `conflict`, `loading`
  - `userMessage`: 사용자에게 보여줄 설명
  - `uiTreatment`: `disable`, `inline-validation`, `toast`, `read-only-card`, `redirect`
- **Validation Rules**:
  - 무반응을 허용하지 않는다.
  - 사용자가 다음 행동을 이해할 수 있는 메시지가 필요하다.

### Button Coverage Record

- **Purpose**: 이번 기능에서 어떤 버튼을 활성화했고, 어떤 버튼을 의도적으로 제외했는지 추적한다.
- **Fields**:
  - `targetId`: 연결된 버튼 ID
  - `status`: `activated`, `intentionally-disabled`, `deferred`
  - `reason`: 결정 이유
  - `evidence`: 테스트, 화면 경로, 코드 참조, 문서 항목
  - `followUp`: 후속 작업 필요 여부
- **Validation Rules**:
  - 모든 인벤토리 버튼은 하나의 Coverage Record를 가져야 한다.
  - `deferred` 항목은 이유와 후속 작업 힌트를 남겨야 한다.
  - 리뷰어가 10분 안에 분류를 이해할 수 있어야 한다.

## Relationships

- 하나의 **Button Action Target**은 하나 이상의 **Interaction Result**를 가진다.
- 하나의 **Button Action Target**은 0개 이상 **Guard Condition**을 가진다.
- 하나의 **Button Action Target**은 정확히 하나의 **Button Coverage Record**를 가진다.

## State Transitions

### Button Action Target

`Inventoried` → `Implemented` | `Intentionally Disabled` | `Deferred`

- `Inventoried`: 버튼이 범위에 포함되고 현재 상태가 기록된 상태
- `Implemented`: 실제 결과와 피드백이 연결된 상태
- `Intentionally Disabled`: 아직 제공하지 않지만 무반응 대신 이유가 보이는 상태
- `Deferred`: 이번 범위 밖으로 남겼지만 근거가 기록된 상태

### Interaction Result

`Idle` → `Pending` → `Succeeded` | `Failed` | `Blocked`

- `Blocked`: 권한/입력/지원 범위 제한으로 실행되지 못했지만 이유가 보이는 상태
- `Failed`: 실행은 시도했으나 오류가 발생해 사용자가 재시도 또는 다음 행동을 선택할 수 있는 상태

## Notes for Implementation

- 기존 라우트/서버 액션/컴포넌트 상태를 재사용하는 것이 기본 전략이다.
- 새 영속 모델을 추가하지 않아도 이 데이터 모델은 테스트와 문서화 기준으로 사용된다.
- Coverage Record는 구현 중 실제 표나 markdown 체크리스트로 구체화할 수 있다.
