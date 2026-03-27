# Contract: Button Interaction Coverage

## Purpose

주요 프로젝트/이슈 화면에서 보이는 버튼이 무반응으로 끝나지 않도록, 구현과 리뷰가 함께 확인할 최소 계약을 정의한다.

## In-Scope Screens

- `/projects/new`
- `/projects/[projectId]`
- `/projects/[projectId]/issues/new`
- project issue drawer and full-page issue detail surfaces
- `/projects/[projectId]/settings`

## Per-Button Contract

각 인벤토리 버튼은 아래 항목을 만족해야 한다.

| Field | Requirement |
|-------|-------------|
| `screen` | 버튼이 보이는 라우트 또는 컴포넌트가 식별 가능해야 한다. |
| `label` | 사용자에게 보이는 텍스트 또는 접근성 이름이 있어야 한다. |
| `currentStatus` | `activated`, `intentionally-disabled`, `deferred` 중 하나여야 한다. |
| `expectedResult` | navigation, panel open/close, save/update, state change, limitation message 중 하나 이상이어야 한다. |
| `pendingFeedback` | 비동기 동작이면 disabled/loading/pending copy 중 하나가 필요하다. |
| `failureFeedback` | 실패 또는 차단 시 inline message, toast, read-only notice 중 하나가 필요하다. |
| `duplicateProtection` | 저장/변경 버튼은 중복 실행 방지 방식이 설명되어야 한다. |
| `evidence` | 테스트 이름, 수동 검증 단계, 또는 코드 경로가 남아야 한다. |

## Required Outcomes

### 1. Activated buttons

- 클릭 또는 제출 시 사용자가 즉시 이해 가능한 결과가 발생해야 한다.
- 결과는 아래 중 하나 이상이어야 한다.
  - route 이동
  - drawer/modal/filter/section 열기 또는 닫기
  - 서버/클라이언트 상태 업데이트
  - 성공 메시지 또는 갱신된 화면 상태

### 2. Blocked buttons

- 조건이 부족하거나 권한이 없거나 기능이 아직 미지원이면 조용히 끝나면 안 된다.
- 아래 중 하나로 처리해야 한다.
  - 사전 disabled 상태 + 설명 텍스트
  - 클릭 후 즉시 limitation/error message
  - read-only card 또는 대체 안내

### 3. Deferred buttons

- 이번 구현에서 다루지 않는 버튼도 기록에서 빠지면 안 된다.
- 각 항목은 다음 정보를 남겨야 한다.
  - 왜 제외했는가
  - 어떤 후속 기능이나 조건이 필요한가
  - 현재 사용자는 어떤 경험을 보게 되는가

## Minimum Verification Matrix

| Screen Group | Verification |
|--------------|--------------|
| Project create | Create button submits, validation errors surface, success lands on project flow |
| Project board | Header/mobile action buttons open expected UI or navigate; no visible no-op buttons remain |
| Issue create | Cancel/close/create buttons all produce expected result and prevent duplicate submit |
| Issue detail | Update/comment/close related controls show success, failure, or blocked feedback |
| Project settings | Section controls navigate or switch section, and destructive/settings actions show explicit progress/result |

## Coverage Record Format

구현 중 또는 구현 후 아래 표 형식으로 버튼 범위를 기록한다.

| Button | Screen | Status | Result or Limitation | Evidence | Follow-up |
|--------|--------|--------|----------------------|----------|-----------|
| `General` | `project-settings-screen` | `activated` or `intentionally-disabled` | `scrolls to general section` / `read-only in v1` | test or manual step | optional |

## Exit Criteria

- 인벤토리된 in-scope 버튼 중 무반응 사례가 0건이어야 한다.
- 비동기 버튼은 모두 pending and failure feedback을 가져야 한다.
- 리뷰어가 Coverage Record만으로 활성화 범위와 제외 범위를 구분할 수 있어야 한다.

## Coverage Cross-Reference

아래 coverage 레코드 항목은 Exit Criteria의 핵심 검증 지점과 직접 연결된다.

| Coverage Record Item | Contract Field / Exit Criteria | Current Evidence Location |
|----------------------|--------------------------------|---------------------------|
| `Status` | `currentStatus` must be `activated`, `intentionally-disabled`, or `deferred`. | `button-coverage.md` Outcome Vocabulary + per-button rows |
| `Result or Limitation` | `expectedResult` and Required Outcomes 1-3 must explain user-visible behavior. | `button-coverage.md` Current In-Scope Inventory |
| Pending copy such as `Saving project details...` / `Creating issue...` | `pendingFeedback` and Exit Criteria line 2 | `button-coverage.md` Async Feedback Expectations |
| Retry toast or inline failure banner | `failureFeedback` and Exit Criteria line 2 | `button-coverage.md` Async Feedback Expectations + per-button rows |
| Disabled or duplicate-blocked state | `duplicateProtection` and Required Outcomes 2 | `button-coverage.md` Async Feedback Expectations |
| Test or file references in `Evidence` | `evidence` and Exit Criteria line 3 | `button-coverage.md` Evidence column, `quickstart.md` validation steps |

리뷰 시에는 계약 문서만 따로 읽지 말고 `button-coverage.md`의 각 행이 위 표의 어떤 계약 필드를 충족하는지 함께 확인한다.
