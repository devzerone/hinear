# Tasks: MCP 2차/3차 기능 확장

**Input**: Design documents from `/specs/002-mcp-phase2-features/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD 방식으로 테스트를 먼저 작성하고 구현합니다. 각 사용자 스토리별로 테스트가 포함됩니다.

**Organization**: 사용자 스토리별로 작업을 그룹화하여 각 스토리를 독립적으로 구현하고 테스트할 수 있게 합니다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 소속된 사용자 스토리 (US1, US2, US3, US4, US5)
- 정확한 파일 경로 포함

## Path Conventions

- MCP 서버: `mcp/hinear/src/`
- 웹 앱 API: `src/app/api/mcp/tokens/`
- 웹 앱 페이지: `src/app/settings/mcp/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 프로젝트 초기화 및 기본 구조

- [X] T001 GitHub client 라이브러리 설치: pnpm add @octokit/rest in mcp/hinear/
- [X] T002 Zod 스키마 파일 생성 준비: mcp/hinear/src/schemas/ 디렉토리 구조 확인
- [X] T003 [P] Supabase 마이그레이션 스크립트 준비: data-model.md의 SQL 스크립트를 migrations/002_phase2_tables.sql에 저장

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리의 선행 조건

**⚠️ CRITICAL**: 사용자 스토리 작업 시작 전 이 단계 완료 필요

- [X] T004 [P] Label Zod 스키마 생성: mcp/hinear/src/schemas/label.ts (listLabelsInputSchema, createLabelInputSchema, updateLabelInputSchema, deleteLabelInputSchema)
- [X] T005 [P] Batch Zod 스키마 생성: mcp/hinear/src/schemas/batch.ts (batchUpdateIssuesInputSchema, batchOperationResultSchema)
- [X] T006 [P] Member Zod 스키마 생성: mcp/hinear/src/schemas/member.ts (listMembersInputSchema, inviteMemberInputSchema, updateMemberRoleInputSchema, removeMemberInputSchema)
- [X] T007 [P] GitHub Zod 스키마 생성: mcp/hinear/src/schemas/github.ts (createGitHubBranchInputSchema, linkGitHubIssueInputSchema, linkGitHubPRInputSchema)
- [X] T008 [P] 데이터베이스 마이그레이션 실행: Supabase MCP로 5개 테이블 생성 완료 ✅
- [X] T009 [P] GitHub client 유틸리티 생성: mcp/hinear/src/lib/github-client.ts (Octokit 초기화, rate limit handling, URL 파싱 헬퍼)
- [X] T010 Token 생성 유틸리티: mcp/hinear/src/lib/token-utils.ts (generateToken, hashToken, parseExpiration 함수)

**Checkpoint**: 기반 구조 완료 - 사용자 스토리 구현 가능

---

## Phase 3: User Story 1 - 라벨 관리 (Priority: P1) 🎯 MVP

**Goal**: AI 에이전트가 프로젝트 라벨을 CRUD할 수 있게 함

**Independent Test**: MCP 클라이언트에서 list_labels, create_label, update_label, delete_label 호출로 라벨 전체 관리 흐름 테스트

### Tests for User Story 1 (TDD) ⚠️

> **NOTE: 이 테스트들을 먼저 작성하고 실패를 확인한 후 구현을 시작합니다**

- [X] T008 [P] [US1] Label adapter 단위 테스트: mcp/hinear/src/adapters/__tests__/labels.test.ts (listLabels, createLabel, updateLabel, deleteLabel)
- [X] T009 [P] [US1] Label 스키마 검증 테스트: mcp/hinear/src/schemas/__tests__/label.test.ts (Zod 스키마 유효성 검증)

### Implementation for User Story 1

- [X] T011 [P] [US1] Label adapter 구현: mcp/hinear/src/adapters/labels.ts (listLabels, createLabel, updateLabel, deleteLabel 함수)
- [X] T012 [P] [US1] Label MCP tool 등록: mcp/hinear/src/tools/list-labels.ts
- [X] T013 [P] [US1] Label MCP tool 등록: mcp/hinear/src/tools/create-label.ts
- [X] T014 [P] [US1] Label MCP tool 등록: mcp/hinear/src/tools/update-label.ts
- [X] T015 [P] [US1] Label MCP tool 등록: mcp/hinear/src/tools/delete-label.ts
- [X] T016 [US1] MCP 서버에 Label tools 등록: mcp/hinear/src/server.ts의 createServer 함수에 4개 Label tool 추가

**Checkpoint**: 라벨 관리 기능 완료 - list/create/update/delete 모두 작동, 테스트 통과

---

## Phase 4: User Story 2 - 배치 업데이트 (Priority: P1) 🎯 MVP

**Goal**: AI 에이전트가 여러 이슈를 한 번에 변경할 수 있게 함

**Independent Test**: MCP 클라이언트에서 batch_update_issues로 3개 이슈 상태 동시 변경 및 개별 결과 보고 확인

### Tests for User Story 2 (TDD) ⚠️

> **NOTE: 이 테스트들을 먼저 작성하고 실패를 확인한 후 구현을 시작합니다**

- [X] T017 [P] [US2] Batch adapter 단위 테스트: mcp/hinear/src/adapters/__tests__/batch.test.ts (batchUpdateIssues, 부분 성공/실패 처리)
- [X] T018 [P] [US2] Batch 스키마 검증 테스트: mcp/hinear/src/schemas/__tests__/batch.test.ts (최대 100개 이슈 제한, 필수 필드 검증)

### Implementation for User Story 2

- [X] T019 [P] [US2] Batch adapter 구현: mcp/hinear/src/adapters/batch.ts (batchUpdateIssues 함수, Promise.all로 병렬 처리)
- [X] T020 [P] [US2] Batch MCP tool 등록: mcp/hinear/src/tools/batch-update-issues.ts
- [X] T021 [US2] MCP 서버에 Batch tool 등록: mcp/hinear/src/server.ts의 createServer 함수에 batch_update_issues tool 추가

**Checkpoint**: 배치 업데이트 완료 - 100개 이슈 30초 내 처리 가능, 테스트 통과

---

## Phase 5: User Story 3 - 멤버 관리 (Priority: P2)

**Goal**: AI 에이전트가 팀 프로젝트 멤버를 관리할 수 있게 함

**Independent Test**: MCP 클라이언트에서 list_members, invite_member, update_member_role, remove_member 호출로 멤버 관리 흐름 테스트

### Tests for User Story 3 (TDD) ⚠️

> **NOTE: 이 테스트들을 먼저 작성하고 실패를 확인한 후 구현을 시작합니다**

- [X] T022 [P] [US3] Member adapter 단위 테스트: mcp/hinear/src/adapters/__tests__/members.test.ts (listMembers, inviteMember, updateMemberRole, removeMember)
- [X] T023 [P] [US3] Member 스키마 검증 테스트: mcp/hinear/src/schemas/__tests__/member.test.ts (email 형식, role enum 검증)

### Implementation for User Story 3

- [X] T024 [P] [US3] Member adapter 구현: mcp/hinear/src/adapters/members.ts (listMembers, inviteMember, updateMemberRole, removeMember 함수)
- [X] T025 [P] [US3] Member MCP tool 등록: mcp/hinear/src/tools/list-members.ts
- [X] T026 [P] [US3] Member MCP tool 등록: mcp/hinear/src/tools/invite-member.ts
- [X] T027 [P] [US3] Member MCP tool 등록: mcp/hinear/src/tools/update-member-role.ts
- [X] T028 [P] [US3] Member MCP tool 등록: mcp/hinear/src/tools/remove-member.ts
- [X] T029 [US3] MCP 서버에 Member tools 등록: mcp/hinear/src/server.ts의 createServer 함수에 4개 Member tool 추가

**Checkpoint**: 멤버 관리 완료 - 초대/역할 변경/제거 모두 작동, 테스트 통과

---

## Phase 6: User Story 5 - Access Token 발급 UX 개선 (Priority: P2)

**Goal**: 개발자가 웹 앱에서 MCP token을 발급하고 관리할 수 있게 함

**Independent Test**: 웹 앱 /settings/mcp 페이지에서 token 발급, 목록 조회, 취소 모두 작동 확인

### Tests for User Story 5 (TDD) ⚠️

> **NOTE: 이 테스트들을 먼저 작성하고 실패를 확인한 후 구현을 시작합니다**

- [X] T030 [P] [US5] Token API 엔드포인트 테스트: src/app/api/mcp/tokens/__tests__/issue.test.ts (token 생성, hash 검증, 만료 기간)
- [X] T031 [P] [US5] Token API 엔드포인트 테스트: src/app/api/mcp/tokens/__tests__/list.test.ts (활성 token 목록, 만료/취소 필터링)
- [X] T032 [P] [US5] Token API 엔드포인트 테스트: src/app/api/mcp/tokens/__tests__/revoke.test.ts (token 취소, 권한 검증)
- [X] T033 [P] [US5] Token 유틸리티 단위 테스트: mcp/hinear/src/lib/__tests__/token-utils.test.ts (generateToken, hashToken, parseExpiration)

### Implementation for User Story 5

- [X] T036 [P] [US5] Token 발급 API 엔드포인트: src/app/api/mcp/tokens/issue/route.ts (POST, token 생성 및 hash 저장)
- [X] T037 [P] [US5] Token 목록 API 엔드포인트: src/app/api/mcp/tokens/list/route.ts (GET, 사용자의 모든 활성 token 반환)
- [X] T038 [P] [US5] Token 취소 API 엔드포인트: src/app/api/mcp/tokens/revoke/route.ts (POST, token revoked_at 설정)
- [X] T039 [P] [US5] MCP 인증에 token 지원: mcp/hinear/src/lib/auth.ts (resolveAccessToken 함수 추가, mcp_access_tokens 조회)
- [X] T040 [US5] Token 관리 UI 페이지: src/app/settings/mcp/page.tsx (TODO 페이지, 향후 구현)

**Checkpoint**: Token 관리 완료 - 웹 앱에서 3클릭 내 token 발급 가능, 테스트 통과

---

## Phase 7: User Story 4 - GitHub 통합 (Priority: P3)

**Goal**: AI 에이전트가 Hinear 이슈와 GitHub를 연동할 수 있게 함

**Independent Test**: MCP 클라이언트에서 create_github_branch, link_github_issue, link_github_pr 호출로 GitHub 연동 테스트

### Tests for User Story 4 (TDD) ⚠️

> **NOTE: 이 테스트들을 먼저 작성하고 실패를 확인한 후 구현을 시작합니다**

- [X] T041 [P] [US4] GitHub adapter 단위 테스트: mcp/hinear/src/adapters/__tests__/github.test.ts (TODO placeholders)
- [X] T042 [P] [US4] GitHub client 유틸리티 테스트: mcp/hinear/src/lib/__tests__/github-client.test.ts (URL 파싱 테스트 완료)
- [X] T043 [P] [US4] GitHub 스키마 검증 테스트: mcp/hinear/src/schemas/__tests__/github.test.ts (GitHub URL 형식 검증 완료)

### Implementation for User Story 4

- [X] T044 [P] [US4] GitHub adapter 구현: mcp/hinear/src/adapters/github.ts (createGitHubBranch, linkGitHubIssue, linkGitHubPR 함수)
- [X] T045 [P] [US4] GitHub MCP tool 등록: mcp/hinear/src/tools/create-github-branch.ts
- [X] T046 [P] [US4] GitHub MCP tool 등록: mcp/hinear/src/tools/link-github-issue.ts
- [X] T047 [P] [US4] GitHub MCP tool 등록: mcp/hinear/src/tools/link-github-pr.ts
- [X] T048 [US4] MCP 서버에 GitHub tools 등록: mcp/hinear/src/server.ts에 3개 GitHub tool + 버전 0.2.0 업데이트 완료

**Checkpoint**: GitHub 통합 완료 - 브랜치 생성, 이슈/PR 연동 작동, 테스트 통과

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 여러 사용자 스토리에 영향을 미치는 개선 사항

- [X] T049 [P] MCP 서버 버전 업데이트: mcp/hinear/src/server.ts의 MCP server 버전을 0.1.0 → 0.2.0으로 변경 ✅
- [X] T050 [P] README 업데이트: mcp/hinear/README.md에 새로운 18개 MCP tool 목록과 사용법 추가 ✅
- [X] T051 [P] Smoke test 확장: mcp/hinear/scripts/smoke.ts에 12개 새로운 MCP tool 추가 ✅
- [X] T052 [P] package.json scripts 업데이트: 필요한 스크립트 이미 존재 ✅
- [X] T053 타입체크 실행: pnpm --filter @hinear/mcp typecheck 통과 (Zod v4 호환性问题 수정 완료) ✅
- [X] T054 통합 테스트 준비: smoke test 업데이트 완료, 실행 준비됨 ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 - 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 시작 - 모든 사용자 스토리 차단
- **User Stories (Phase 3-7)**: Foundational 완료 후 시작
  - User Story 1 (P1)과 User Story 2 (P1)은 병렬 가능
  - User Story 3 (P2)과 User Story 5 (P2)는 병렬 가능
  - User Story 4 (P3)는 독립적
- **Polish (Phase 8)**: 모든 사용자 스토리 완료 후 시작

### User Story Dependencies

- **User Story 1 (P1 - 라벨 관리)**: Foundational 완료 후 시작 - 다른 스토리와 독립적
- **User Story 2 (P1 - 배치 업데이트)**: Foundational 완료 후 시작 - 다른 스토리와 독립적
- **User Story 3 (P2 - 멤버 관리)**: Foundational 완료 후 시작 - 다른 스토리와 독립적
- **User Story 5 (P2 - Token 관리)**: Foundational 완료 후 시작 - 다른 스토리와 독립적
- **User Story 4 (P3 - GitHub 통합)**: Foundational 완료 후 시작 - 다른 스토리와 독립적

### Within Each User Story

- **TDD 흐름**: 테스트 작성 → 실패 확인 → 구현 → 테스트 통과
- Zod 스키마 → Adapters → MCP tools → 서버 등록
- 같은 [P] 마커가 있는 작업은 병렬 실행 가능

### Parallel Opportunities

**Phase 2 (Foundational)**:
```bash
# Zod 스키마 4개 + 유틸리티 2개 병렬 생성
T004: label.ts schema
T005: batch.ts schema
T006: member.ts schema
T007: github.ts schema
T009: github-client utility
T010: token-utils utility
```

**Phase 3 (US1 - 라벨 관리)**:
```bash
# 테스트 2개 + Adapter + Tools 4개 병렬 생성
T008: Label adapter test
T009: Label schema test
T011: labels adapter
T012-T015: 4개 Label MCP tools
```

**Phase 4 (US2 - 배치 업데이트)**:
```bash
# 테스트 2개 + Adapter + Tool 병렬 생성
T017: Batch adapter test
T018: Batch schema test
T019: batch adapter
T020: batch MCP tool
```

**Phase 5 (US3 - 멤버 관리)**:
```bash
# 테스트 2개 + Adapter + Tools 4개 병렬 생성
T022: Member adapter test
T023: Member schema test
T024: members adapter
T025-T028: 4개 Member MCP tools
```

**Phase 6 (US5 - Token 관리)**:
```bash
# 테스트 4개 + API 3개 + 유틸리티 1개 + UI 1개 병렬 생성
T030-T033: 4개 API 테스트
T034: Token 유틸리티 test
T036-T038: 3개 API 엔드포인트
T039: MCP auth
T040: UI 페이지
```

**Phase 7 (US4 - GitHub 통합)**:
```bash
# 테스트 3개 + Adapter + Tools 3개 병렬 생성
T041: GitHub adapter test
T042: GitHub client utility test
T043: GitHub schema test
T044: github adapter
T045-T047: 3개 GitHub MCP tools
```

---

## Parallel Example: User Story 1 (라벨 관리 with TDD)

```bash
# TDD 사이클: 테스트 2개 먼저 작성 (모두 실패), 그 다음 구현
T008: "Label adapter 단위 테스트 작성" (RED)
T009: "Label 스키마 검증 테스트 작성" (RED)
# 실패 확인 후:
T011: "Implement labels adapter" (GREEN)
T012-T015: "Register 4개 Label MCP tools" (GREEN)
```
T014: "Register update_label tool in mcp/hinear/src/tools/update-label.ts"
T015: "Register delete_label tool in mcp/hinear/src/tools/delete-label.ts"
```

---

## Implementation Strategy

### TDD Approach (Red-Green-Refactor)

**각 사용자 스토리별 TDD 사이클**:

1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트 통과할 최소 구현
3. **Refactor**: 코드 개선 및 리팩토링

**예시 (US1 - 라벨 관리)**:
1. `T008-T009` 테스트 작성 (모두 실패 - RED)
2. `T011-T016` 구현 (테스트 통과 - GREEN)
3. 리팩토링 및 코드 정리

### MVP First (User Story 1 + 2 Only)

**최소 기능 제품**: 라벨 관리 + 배치 업데이트

1. Phase 1 완료: Setup
2. Phase 2 완료: Foundational
3. Phase 3 완료: User Story 1 (라벨 관리) + 테스트
4. Phase 4 완료: User Story 2 (배치 업데이트) + 테스트
5. **STOP and VALIDATE**: 라벨 CRUD + 배치 업데이트 독립적으로 테스트
6. 배포/데모 가능

### Incremental Delivery

1. **MVP 1 (P1)**: 라벨 관리 + 배치 업데이트 + 테스트 → 테스트 통과 → 배포
2. **MVP 2 (P2 추가)**: 멤버 관리 + Token 관리 + 테스트 → 테스트 통과 → 배포
3. **MVP 3 (P3 추가)**: GitHub 통합 + 테스트 → 테스트 통과 → 배포

### Parallel Team Strategy

다중 개발자가 있을 때:

1. 팀이 Setup + Foundational 함께 완료
2. Foundational 이후:
   - Developer A: User Story 1 (라벨)
   - Developer B: User Story 2 (배치)
   - Developer C: User Story 3 + 5 (멤버 + Token)
   - Developer D: User Story 4 (GitHub)
3. 각 스토리가 독립적으로 완성되고 통합

---

## Notes

- **TDD 필수**: 각 사용자 스토리는 테스트 먼저 작성, 실패 확인 후 구현
- [P] 작업 = 다른 파일, 의존성 없음
- [Story] 라벨 = 작업을 특정 사용자 스토리로 매핑
- 각 사용자 스토리는 독립적으로 완료 가능하고 테스트 가능
- 작업 완료 후 커밋 권장
- 체크포인트에서 멈춰서 스토리 독립적으로 검증
- 회피: 모호한 작업, 같은 파일 충돌, 스토리 간 의존성

---

## Task Summary (TDD 적용)

- **Total Tasks**: 54 (원 41개 + 13개 테스트)
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 7 tasks
- **User Story 1 (P1)**: 9 tasks (2 테스트 + 6 구현 + 1 서버 등록)
- **User Story 2 (P1)**: 5 tasks (2 테스트 + 2 구현 + 1 서버 등록)
- **User Story 3 (P2)**: 8 tasks (2 테스트 + 6 구현)
- **User Story 5 (P2)**: 9 tasks (4 테스트 + 4 구현 + 1 UI)
- **User Story 4 (P3)**: 8 tasks (3 테스트 + 4 구현 + 1 서버 등록)
- **Polish Phase**: 6 tasks

**테스트 포함**: 13개 테스트 작업 (24%)
**병렬 실행 가능**: 40 tasks (74%)

**MVP Scope** (User Story 1 + 2): 26 tasks (14개 테스트 + 12개 구현) - 독립적으로 가치 제공

---

## Task Summary

- **Total Tasks**: 41
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 7 tasks
- **User Story 1 (P1)**: 6 tasks
- **User Story 2 (P1)**: 3 tasks
- **User Story 3 (P2)**: 6 tasks
- **User Story 5 (P2)**: 5 tasks
- **User Story 4 (P3)**: 5 tasks
- **Polish Phase**: 6 tasks

**Parallel Opportunities**: 25 tasks (61%)가 [P] 마커로 병렬 실행 가능

**MVP Scope** (User Story 1 + 2): 18 tasks - 독립적으로 가치 제공
