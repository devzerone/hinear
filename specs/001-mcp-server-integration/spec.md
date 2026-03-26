# Feature Specification: Hinear MCP 서버 통합 및 기능 확장

**Feature Branch**: `001-mcp-server-integration`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "지금 mcp를 만드는 작업을 하고 있었거든? 확인해서 적어봐"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - MCP 서버 로컬 개발 환경 설정 (Priority: P1)

개발자가 로컬 환경에서 Hinear MCP 서버를 실행하고 테스트할 수 있어야 합니다.

**Why this priority**: MCP 서버가 기본적으로 동작하지 않으면 다른 모든 기능을 테스트할 수 없습니다. 로컬 개발 환경은 모든 작업의 전제 조건입니다.

**Independent Test**: `pnpm mcp:hinear:login`으로 인증 설정 후 `pnpm mcp:hinear`로 서버를 시작하고 `pnpm mcp:hinear:smoke`로 기본 동작을 확인할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 깨끗한 로컬 환경, **When** `pnpm install` 실행, **Then** 모든 의존성이 설치되어야 함
2. **Given** 설치된 환경, **When** `pnpm mcp:hinear:login` 실행, **Then** 필수 환경 변수가 `mcp/hinear/.env.local`에 저장되어야 함
3. **Given** 설정된 환경 변수, **When** `pnpm mcp:hinear` 실행, **Then** stdio MCP 서버가 정상적으로 시작되어야 함
4. **Given** 실행 중인 MCP 서버, **When** `pnpm mcp:hinear:smoke` 실행, **Then** `hinear_mcp_status` tool이 성공적으로 응답해야 함

---

### User Story 2 - MCP 기본 읽기 기능 (Priority: P1)

AI 에이전트가 Hinear 프로젝트와 이슈 정보를 조회할 수 있어야 합니다.

**Why this priority**: 이슈 관리를 위한 AI 도우미가 가장 먼저 필요로 하는 기능입니다. 읽기 기능 없이는 어떤 유용한 작업도 수행할 수 없습니다.

**Independent Test**: MCP 클라이언트에서 `list_projects`와 `search_issues`를 호출하여 프로젝트 목록과 이슈 검색 결과를 확인할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 인증된 MCP 서버, **When** `list_projects` 호출, **Then** 사용자가 접근 가능한 모든 프로젝트 목록이 반환되어야 함
2. **Given** 프로젝트 목록, **When** 특정 프로젝트 ID로 `search_issues` 호출, **Then** 해당 프로젝트의 이슈 목록이 반환되어야 함
3. **Given** 검색 기능, **When** 상태/우선순위/담당자 필터 적용, **Then** 필터링된 이슈만 반환되어야 함
4. **Given** 이슈 목록, **When** 특정 이슈 ID로 `get_issue_detail` 호출, **Then** 이슈의 상세 정보(코멘트, 활동 로그 포함)가 반환되어야 함

---

### User Story 3 - MCP 쓰기 기능 (Priority: P2)

AI 에이전트가 이슈를 생성하고 상태를 변경하며 코멘트를 추가할 수 있어야 합니다.

**Why this priority**: 읽기 기능만으로는 이슈 관리 작업을 자동화할 수 없습니다. AI 에이전트가 사용자를 대신하여 이슈를 관리하려면 쓰기 기능이 필요합니다.

**Independent Test**: `pnpm mcp:hinear:smoke --write`로 모든 쓰기 기능이 통합 테스트됩니다.

**Acceptance Scenarios**:

1. **Given** 인증된 MCP 서버와 프로젝트, **When** `create_issue` 호출, **Then** 새 이슈가 생성되고 이슈 ID가 반환되어야 함
2. **Given** 생성된 이슈, **When** `update_issue_status` 호출, **Then** 이슈 상태가 변경되고 활동 로그가 기록되어야 함
3. **Given** 이슈 상태 변경, **When** 선택적 코멘트 포함, **Then** 상태 변경과 함께 코멘트가 추가되어야 함
4. **Given** 존재하는 이슈, **When** `add_comment` 호출, **Then** 코멘트가 추가되고 활동 로그가 기록되어야 함

---

### User Story 4 - 인증 및 접근 제어 (Priority: P2)

MCP 서버가 사용자별로 적절한 접근 권한을 적용해야 합니다.

**Why this priority**: 보안과 데이터 무결성을 위해 필수적입니다. 사용자는 자신이 접근 권한이 있는 프로젝트와 이슈만 볼 수 있어야 합니다.

**Independent Test**: 서로 다른 사용자로 로그인하여 각각 접근 가능한 프로젝트와 이슈가 다른지 확인할 수 있습니다.

**Acceptance Scenarios**:

1. **Given** 인증된 사용자, **When** `list_projects` 호출, **Then** 해당 사용자가 멤버인 프로젝트만 반환되어야 함
2. **Given** 접근 권한 없는 프로젝트의 이슈 ID, **When** `get_issue_detail` 호출, **Then** 접근 거부 오류가 반환되어야 함
3. **Given** 개인 프로젝트, **When** 소유자가 아닌 사용자가 접근 시도, **Then** 접근 거부 오류가 반환되어야 함
4. **Given** 팀 프로젝트, **When** 멤버가 이슈 생성, **Then** 이슈가 정상적으로 생성되어야 함

---

### User Story 5 - CI/CD 통합 (Priority: P3)

MCP 서버가 CI 파이프라인에서 자동으로 테스트되어야 합니다.

**Why this priority**: 코드 변경 시 MCP 서버가 계속 정상 동작하는지 확인해야 합니다. 하지만 로컬 개발보다 우선순위가 낮습니다.

**Independent Test**: GitHub Actions workflow가 MCP smoke 테스트를 실행하고 결과를 보고합니다.

**Acceptance Scenarios**:

1. **Given** PR이 생성됨, **When** CI workflow 실행, **Then** MCP smoke 테스트가 자동으로 실행되어야 함
2. **Given** 필요한 시크릿 설정, **When** read smoke 테스트 실행, **Then** `list_projects`와 `search_issues`가 성공해야 함
3. **Given** 시크릿 미설정, **When** CI workflow 실행, **Then** MCP smoke 테스트가 skip되어야 함
4. **Given** MCP 코드 변경, **When** typecheck 실패, **Then** CI workflow가 실패해야 함

---

### Edge Cases

- What happens when 환경 변수가 설정되지 않았을 때?
- How does system handle MCP 서버 시작 중 Supabase 연결 실패?
- What happens when 사용자의 access token이 만료되었을 때?
- How does system handle 존재하지 않는 이슈 ID로 조회 시도?
- What happens when 라벨이 없는 프로젝트에서 라벨이 포함된 이슈 생성 시도?
- How does system handle 동시에 같은 이슈를 수정하는 상황?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST 로컬 stdio MCP 서버를 제공해야 함
- **FR-002**: System MUST 사용자 인증을 지원해야 함 (access token 또는 user ID)
- **FR-003**: System MUST 프로젝트 접근 권한을 검사해야 함
- **FR-004**: Users MUST be able to 접근 가능한 프로젝트 목록을 조회할 수 있어야 함
- **FR-005**: System MUST 다양한 필터로 이슈를 검색할 수 있어야 함 (상태, 우선순위, 담당자, 라벨)
- **FR-006**: Users MUST be able to 이슈 상세 정보를 조회할 수 있어야 함
- **FR-007**: System MUST 새 이슈를 생성할 수 있어야 함
- **FR-008**: Users MUST be able to 이슈 상태를 변경할 수 있어야 함
- **FR-009**: System MUST 이슈에 코멘트를 추가할 수 있어야 함
- **FR-010**: System MUST 모든 데이터 변경 시 활동 로그를 기록해야 함
- **FR-011**: System MUST MCP 서버 상태를 확인하는 tool을 제공해야 함
- **FR-012**: System MUST CI 파이프라인에서 smoke 테스트를 실행할 수 있어야 함

### Key Entities

- **MCP Server**: stdio 프로토콜로 통신하는 로컬 서버, Hinear 도메인 로직에 연결됨
- **MCP Tool**: MCP 클라이언트가 호출할 수 있는 함수 (list_projects, search_issues 등)
- **MCP Adapter**: MCP tool과 Hinear 도메인 로직 사이의 변환 계층
- **Environment Config**: MCP 서버 실행에 필요한 환경 변수 (Supabase URL, 키, 인증 정보)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 개발자가 5분 이내에 로컬 MCP 서버를 실행하고 첫 요청을 성공시킬 수 있어야 함
- **SC-002**: MCP 서버가 7개의 핵심 tool을 등록하고 응답해야 함
- **SC-003**: Smoke 테스트가 30초 이내에 완료되어야 함
- **SC-004**: CI 파이프라인에서 MCP smoke 테스트가 2분 이내에 완료되어야 함
- **SC-005**: MCP tool 호출의 95%가 1초 이내에 응답해야 함
- **SC-006**: 모든 쓰기 작업이 활동 로그를 기록하여 데이터 변경 추적이 가능해야 함
- **SC-007**: 접근 권한이 없는 리소스 요청의 100%가 거부되어야 함

## Assumptions

- 로컬 개발 환경에는 Node.js와 pnpm이 설치되어 있다고 가정함
- MCP 클라이언트는 stdio 프로토콜을 지원한다고 가정함
- 사용자는 이미 Hinear 계정과 프로젝트를 보유하고 있다고 가정함
- Supabase 데이터베이스는 이미 설정되어 있다고 가정함
- MCP 서버는 로컬 개발 및 테스트용으로 사용된다고 가정함 (프로덕션 배포 제외)
- CI 환경에서는 필요한 시크릿이 GitHub repository에 설정되어 있다고 가정함
- 라벨과 배치 업데이트 기능은 2차 구현으로 가정함
- 실시간 협업 기능은 MCP 범위 밖이라고 가정함
