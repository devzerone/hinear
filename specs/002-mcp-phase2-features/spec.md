# Feature Specification: MCP 2차/3차 기능 확장

**Feature Branch**: `002-mcp-phase2-features`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "MCP 2차/3차 기능 확장: 라벨 관리, 배치 업데이트, 멤버 관리, GitHub 통합"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 라벨 관리 (Priority: P1)

AI 에이전트가 프로젝트의 라벨을 생성, 조회, 수정, 삭제할 수 있어야 합니다.

**Why this priority**: 이슈를 체계적으로 분류하고 관리하기 위해 라벨은 필수적입니다. 1차에서 라벨을 이슈에 연결만 할 수 있었지만, 라벨 자체를 관리할 수 없었습니다.

**Independent Test**: MCP 클라이언트에서 `list_labels`, `create_label`, `update_label`, `delete_label`을 호출하여 라벨 CRUD 작업을 확인할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 인증된 MCP 서버와 프로젝트, **When** `list_labels` 호출, **Then** 프로젝트의 모든 라벨 목록이 반환되어야 함
2. **Given** 프로젝트, **When** `create_label` 호출, **Then** 새 라벨이 생성되고 라벨 ID가 반환되어야 함
3. **Given** 존재하는 라벨, **When** `update_label` 호출, **Then** 라벨 이름, 색상, 설명이 변경되어야 함
4. **Given** 존재하는 라벨, **When** `delete_label` 호출, **Then** 라벨이 삭제되고 연결된 이슈에서도 제거되어야 함
5. **Given** 라벨이 삭제됨, **When** 연결된 이슈 조회, **Then** 이슈에서 해당 라벨이 제거된 상태여야 함

---

### User Story 2 - 배치 업데이트 (Priority: P1)

AI 에이전트가 여러 이슈를 한 번에 상태, 우선순위, 담당자를 변경할 수 있어야 합니다.

**Why this priority**: 칸반 보드에서 여러 이슈를 선택하여 일괄 처리하는 것은 일반적인 작업 흐름입니다. 하나씩 변경하는 것은 비효율적입니다.

**Independent Test**: MCP 클라이언트에서 `batch_update_issues`를 호출하여 여러 이슈의 상태를 동시에 변경하고 결과를 확인할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 인증된 MCP 서버와 프로젝트, **When** `batch_update_issues`로 여러 이슈의 상태 변경, **Then** 모든 이슈의 상태가 변경되고 각 이슈에 활동 로그가 기록되어야 함
2. **Given** 배치 업데이트, **When** 일부 이슈만 성공, **Then** 성공/실패 결과가 각 이슈별로 반환되어야 함
3. **Given** 여러 이슈, **When** 배치로 우선순위 변경, **Then** 모든 이슈의 우선순위가 변경되어야 함
4. **Given** 여러 이슈, **When** 배치로 담당자 변경, **Then** 모든 이슈의 담당자가 변경되고 알림이 전송되어야 함
5. **Given** 배치 작업, **When** `comment_on_change` 포함, **Then** 모든 변경된 이슈에 동일한 코멘트가 추가되어야 함

---

### User Story 3 - 멤버 관리 (Priority: P2)

AI 에이전트가 팀 프로젝트의 멤버를 초대하고 역할을 관리할 수 있어야 합니다.

**Why this priority**: 팀 협업을 위해 멤버 관리는 필요하지만, 프로젝트와 이슈 관리보다 우선순위가 낮습니다. 1차에서는 수동으로 멤버를 추가한다고 가정했습니다.

**Independent Test**: MCP 클라이언트에서 `list_members`, `invite_member`, `update_member_role`, `remove_member`를 호출하여 멤버 관리 작업을 확인할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 팀 프로젝트와 소유자, **When** `list_members` 호출, **Then** 프로젝트의 모든 멤버와 역할이 반환되어야 함
2. **Given** 프로젝트 소유자, **When** `invite_member`로 이메일 초대, **Then** 초대 링크가 생성되고 초대 상태가 기록되어야 함
3. **Given** 멤버, **When** `update_member_role`로 역할 변경, **Then** 멤버의 역할이 변경되고 권한이 즉시 적용되어야 함
4. **Given** 멤버, **When** `remove_member` 호출, **Then** 멤버가 프로젝트에서 제거되고 접근 권한이 취소되어야 함
5. **Given** 초대된 멤버, **When** 아직 수락하지 않은 상태에서 `remove_member`, **Then** 초대가 취소되어야 함

---

### User Story 4 - GitHub 통합 (Priority: P3)

AI 에이전트가 Hinear 이슈를 GitHub 브랜치, 이슈, PR과 연동할 수 있어야 합니다.

**Why this priority**: 개발 워크플로우 자동화를 위한 고급 기능입니다. 기본 이슈 관리가 완성된 후 추가하는 것이 적절합니다.

**Independent Test**: MCP 클라이언트에서 `create_github_branch`, `link_github_issue`, `link_github_pr`을 호출하여 GitHub 연동 작업을 확인할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** Hinear 이슈, **When** `create_github_branch` 호출, **Then** 이슈 식별자가 포함된 GitHub 브랜치가 생성되어야 함
2. **Given** Hinear 이슈와 GitHub 이슈, **When** `link_github_issue` 호출, **Then** 두 이슈가 연결되고 Hinear 이슈에 GitHub 링크가 표시되어야 함
3. **Given** Hinear 이슈와 GitHub PR, **When** `link_github_pr` 호출, **Then** PR이 이슈에 연결되고 상태 변경 시 알림이 전송되어야 함
4. **Given** 연결된 GitHub PR, **When** PR이 merged, **Then** Hinear 이슈 상태가 자동으로 "Done"으로 변경되어야 함
5. **Given** 연결된 GitHub 이슈, **When** GitHub 이슈가 닫힘, **Then** Hinear 이슈에 코멘트가 추가되어야 함

---

### User Story 5 - Access Token 발급 UX 개선 (Priority: P2)

개발자가 Hinear 웹 앱에서 MCP용 access token을 발급하고 자동으로 설정할 수 있어야 합니다.

**Why this priority**: 현재 수동으로 환경 변수를 설정하는 방식은 사용하기 어렵습니다. 웹 앱에서 바로 token을 발급받면 훨씬 편리합니다.

**Independent Test**: Hinear 웹 앱의 설정 페이지에서 "MCP Token 발급" 버튼을 클릭하고 token이 발급되고 `.env.local`에 자동 저장되는지 확인할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 로그인된 사용자, **When** 설정 페이지에서 "MCP Token 발급" 클릭, **Then** access token이 생성되고 화면에 표시되어야 함
2. **Given** 발급된 token, **When** "로컬 설정에 저장" 버튼 클릭, **Then** `mcp/hinear/.env.local` 파일에 token이 자동으로 저장되어야 함
3. **Given** 발급된 token, **When** "복사" 버튼 클릭, **Then** token이 클립보드에 복사되어야 함
4. **Given** 여러 개의 token, **When** token 목록 조회, **Then** 모든 활성 token과 마지막 사용 시간이 표시되어야 함
5. **Given** 오래된 token, **When** "취소" 버튼 클릭, **Then** token이 무효화되고 더 이상 사용할 수 없어야 함

---

### Edge Cases

- What happens when 라벨 이름이 중복될 때?
- How does system handle 배치 업데이트 중 일부 이슈가 삭제된 경우?
- What happens when 프로젝트 소유자가 자신을 제거하려고 할 때?
- How does system handle GitHub API rate limit 초과?
- What happens when GitHub 브랜치가 이미 존재할 때?
- How does system handle 만료된 access token으로 MCP 요청?

## Requirements *(mandatory)*

### Functional Requirements

#### 라벨 관리
- **FR-001**: System MUST 프로젝트의 모든 라벨을 조회할 수 있어야 함
- **FR-002**: Users MUST be able to 새 라벨을 생성할 수 있어야 함 (이름, 색상, 설명)
- **FR-003**: System MUST 라벨 정보를 수정할 수 있어야 함
- **FR-004**: System MUST 라벨을 삭제할 수 있어야 함
- **FR-005**: System MUST 라벨 삭제 시 연결된 이슈에서 라벨을 제거해야 함

#### 배치 업데이트
- **FR-006**: System MUST 여러 이슈의 상태를 한 번에 변경할 수 있어야 함
- **FR-007**: System MUST 여러 이슈의 우선순위를 한 번에 변경할 수 있어야 함
- **FR-008**: System MUST 여러 이슈의 담당자를 한 번에 변경할 수 있어야 함
- **FR-009**: System MUST 배치 작업 결과를 개별 이슈별로 보고해야 함
- **FR-010**: System MUST 배치 작업 시 모든 변경에 활동 로그를 기록해야 함

#### 멤버 관리
- **FR-011**: System MUST 프로젝트 멤버 목록을 조회할 수 있어야 함
- **FR-012**: System MUST 새 멤버를 초대할 수 있어야 함 (이메일 기반)
- **FR-013**: System MUST 멤버 역할을 변경할 수 있어야 함 (owner ↔ member)
- **FR-014**: System MUST 멤버를 제거할 수 있어야 함
- **FR-015**: System MUST 초대를 취소할 수 있어야 함

#### GitHub 통합
- **FR-016**: System MUST Hinear 이슈에서 GitHub 브랜치를 생성할 수 있어야 함
- **FR-017**: System MUST Hinear 이슈와 GitHub 이슈를 연결할 수 있어야 함
- **FR-018**: System MUST Hinear 이슈와 GitHub PR을 연결할 수 있어야 함
- **FR-019**: System MUST GitHub PR merged 시 이슈 상태를 자동 변경해야 함
- **FR-020**: System MUST GitHub 이슈 상태 변경 시 알림을 전송해야 함

#### Access Token 관리
- **FR-021**: System MUST 웹 앱에서 MCP용 access token을 발급할 수 있어야 함
- **FR-022**: System MUST 발급된 token을 조회하고 관리할 수 있어야 함
- **FR-023**: System MUST token을 무효화할 수 있어야 함
- **FR-024**: System MUST token의 마지막 사용 시간을 추적해야 함

### Key Entities

- **Label**: 프로젝트 내 이슈 분류용 태그 (이름, 색상, 설명)
- **Batch Operation**: 여러 이슈에 대한 일괄 작업 (상태, 우선순위, 담당자 변경)
- **Project Member**: 팀 프로젝트의 사용자 (역할: owner/member)
- **Invitation**: 프로젝트 초대 (이메일, 상태, 만료일)
- **GitHub Integration**: Hinear 이슈와 GitHub 리소스 간 연결
- **MCP Access Token**: 웹 앱에서 발급하는 MCP 전용 인증 토큰

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 개발자가 10분 이내에 라벨 관리 MCP tool을 사용하여 라벨 CRUD를 완료할 수 있어야 함
- **SC-002**: 배치 업데이트로 100개 이슈의 상태를 30초 이내에 변경할 수 있어야 함
- **SC-003**: 팀 프로젝트에서 5명의 멤버를 5분 이내에 초대할 수 있어야 함
- **SC-004**: Hinear 이슈에서 GitHub 브랜치 생성이 10초 이내에 완료되어야 함
- **SC-005**: 웹 앱에서 MCP token 발급이 3클릭 이내에 완료되어야 함
- **SC-006**: 모든 MCP tool 호출의 95%가 2초 이내에 응답해야 함
- **SC-007**: 배치 작업 실패 시 100% 결과를 개별 이슈별로 보고해야 함

## Assumptions

- MCP 1차 기능(프로젝트, 이슈, 코멘트)은 이미 구현되어 있다고 가정함
- GitHub repository는 이미 설정되어 있다고 가정함
- GitHub Personal Access Token은 발급되어 있다고 가정함
- 라벨 색상은 hex 코드 (#RRGGBB) 형식이라고 가정함
- 배치 작업은 최대 100개 이슈까지 처리한다고 가정함
- 멤버 초대는 이메일로만 전송된다고 가정함
- GitHub 통합은 하나의 repository만 연결한다고 가정함
- MCP Access Token은 Supabase에 저장된다고 가정함
- 실시간 알림은 Firebase Cloud Messaging을 사용한다고 가정함
- 웹 앱은 이미 Supabase Auth로 인증을 구현했다고 가정함
