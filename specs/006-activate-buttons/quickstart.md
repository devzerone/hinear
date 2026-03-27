# Quickstart: Activate Inactive Buttons

## Goal

주요 프로젝트/이슈 화면에서 클릭 가능한 버튼이 무반응으로 끝나는 사례를 제거하고, 각 버튼의 결과 또는 제한 이유를 일관되게 보이게 만든다.

## 1. Prepare the workspace

```bash
cd /home/choiho/zerone/hinear
pnpm install
pnpm typecheck
pnpm test
```

기준선 확인 포인트:

- 현재 주요 버튼 흐름이 어디에 있는지 파악한다.
- 이미 동작하는 버튼과 겉보기만 클릭 가능한 버튼을 구분한다.
- 기존 피드백 패턴은 `Button`, `HeaderAction`, `MobileIssueListAppBar`, `CreateIssueTabletModal`, `project-settings-screen`, issue detail screens에서 확인한다.

## 2. Build the button inventory

우선 아래 화면을 차례대로 확인한다.

1. `/projects/new`
2. `/projects/[projectId]`
3. `/projects/[projectId]/issues/new`
4. issue drawer / issue full page
5. `/projects/[projectId]/settings`

각 버튼에 대해 다음을 기록한다.

- 화면/컴포넌트
- 보이는 이름 또는 접근성 이름
- 현재 상태: `activated`, `dead`, `blocked`, `deferred`
- 기대 결과
- 실제 결과
- 필요한 수정 방식: navigation, local state, server action, disabled treatment, documentation

## 3. Implement in this order

### Stage A: Dead local controls

가장 먼저 상태 전환이나 이동만 있으면 되는 버튼부터 수정한다.

예시:

- 설정 화면 섹션 버튼
- 모달 닫기/취소 버튼
- 헤더/앱바의 필터, 생성, 검색 토글

검증:

```bash
pnpm test -- --runInBand
```

필요하면 관련 파일만 지정해서 빠르게 반복한다.

추천 빠른 루프:

```bash
pnpm test src/components/molecules/HeaderAction/HeaderAction.test.tsx src/components/molecules/SidebarItem/SidebarItem.test.tsx src/features/projects/components/project-settings-screen.test.tsx --run
```

### Stage B: Mutation feedback alignment

저장/생성/삭제/연결 버튼은 아래 규칙을 맞춘다.

- 처리 중에는 중복 실행이 되지 않아야 한다.
- 성공 후에는 화면 상태, 라우트, 데이터, 또는 toast가 갱신되어야 한다.
- 실패 시에는 재시도 가능한 메시지 또는 제한 이유가 보여야 한다.

우선 후보:

- project details save
- project delete
- issue create
- issue detail update/comment actions
- GitHub connect/disconnect where relevant

검증:

```bash
pnpm typecheck
pnpm test src/features/projects/components/project-workspace-screen.test.tsx src/features/projects/components/project-overview-screen.test.tsx src/components/organisms/CreateIssueTabletModal/CreateIssueTabletModal.test.tsx src/features/issues/hooks/useIssues.test.tsx --run
```

### Stage C: Unsupported or deferred controls

아직 실제 기능이 없는 버튼은 일반 활성 버튼처럼 남겨두지 않는다.

- disabled/read-only 처리
- limitation message 추가
- coverage record에 `deferred` 또는 `intentionally-disabled`로 남기기

## 4. Final validation

최종 검증 명령:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

수동 검증 체크:

- 모든 in-scope 버튼이 클릭 후 무반응으로 끝나지 않는가
- 저장/삭제/연결 버튼이 pending 상태를 보여주는가
- 실패 또는 제한 메시지가 즉시 이해 가능한가
- project settings 섹션 이동/전환이 실제로 동작하거나 명시적으로 비활성화되었는가
- coverage record만 보고 활성화 범위와 제외 범위를 구분할 수 있는가

문서 검증 체크:

- `button-coverage.md`에 status, result/limitation, evidence, follow-up가 모두 남아 있는가
- reusable action primitives에서 no-op 버튼이 자동으로 disabled treatment로 바뀌는가
- reviewer가 5초 안에 “실제 동작”과 “의도적 제한”을 구분할 수 있는가

5초 인지 검증 단계:

1. 프로젝트 설정 화면에서 `Save project details` 또는 `Delete this project`를 실행한다.
2. 5초 안에 버튼 라벨 변화(`Saving...`, `Deleting...`) 또는 섹션 배너/토스트 중 하나로 현재 상태를 바로 식별할 수 있어야 한다.
3. 이슈 생성 모달에서는 `Creating issue...`와 duplicate-block 문구가 동시에 보여야 한다.
4. 보드 상태 변경, 드로어 저장, 상세 댓글 작성은 실패 시 5초 안에 retry 가능한 문구를 inline banner 또는 toast로 읽을 수 있어야 한다.
5. blocked/deferred 버튼은 5초 안에 “왜 지금 안 되는지”를 disabled text나 read-only 문구만 보고 구분할 수 있어야 한다.

## 5. Implementation handoff notes

- 기존 feature layering을 깨지 말고 UI는 기존 action/lib/repository 경로를 사용한다.
- 새 버튼이 추가되면 이 feature의 coverage record 형식도 함께 갱신한다.
- “핸들러 추가”만으로 끝내지 말고, 사용자가 결과를 인지하는지까지 확인한다.

## 6. Validation Record

기본 primary-flow 점검 범위:

- `/projects/new`: 생성 액션, validation, next-step copy 확인
- `/projects/[projectId]`: 보드 필터/생성/상태 변경 pending notice 확인
- `/projects/[projectId]/issues/[issueId]`: 저장/댓글 success and failure banner 확인
- `/projects/[projectId]/settings`: 섹션 이동, 저장 pending copy, 삭제 success/failure banner 확인

2026-03-27 14:57:58 KST 기준 실행 기록:

- Targeted tests:
  - `pnpm test src/components/organisms/CreateIssueTabletModal/CreateIssueTabletModal.test.tsx --run`
  - `pnpm test src/features/issues/hooks/useIssues.test.tsx src/features/issues/components/KanbanBoardView.test.tsx --run`
  - `pnpm test src/features/issues/components/issue-drawer-screen.test.tsx src/features/issues/components/issue-detail-full-page-screen.test.tsx --run`
  - `pnpm test src/features/projects/components/project-settings-screen.test.tsx src/features/projects/components/project-operation-cards.test.tsx --run`
- Expected reviewer result:
  - No in-scope async button should look idle during a live request.
  - Every failure path used in the feature should leave either inline guidance, toast guidance, or both.

2026-03-27 15:01:12 KST 최종 command set:

- `pnpm typecheck` → passed
- `pnpm lint` → passed
- `pnpm test` → passed after rerunning outside the sandbox because one test needed local port binding (`listen EPERM` under sandbox)
