# Implementation Plan: MCP 2차/3차 기능 확장

**Branch**: `002-mcp-phase2-features` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-mcp-phase2-features/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Hinear MCP 서버의 2차/3차 기능을 구현하여 AI 에이전트가 라벨 관리, 배치 업데이트, 멤버 관리, GitHub 통합, Access Token 관리를 수행할 수 있게 합니다. 1차 기능(프로젝트, 이슈, 코멘트)은 이미 구현되어 있으며, 이번 확장에서는 팀 협업과 개발 워크플로우 자동화를 위한 고급 기능을 추가합니다.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**:
  - @modelcontextprotocol/sdk (MCP server)
  - Zod (schema validation)
  - Supabase JS Client (data access)
  - Supabase Edge Functions (server actions)

**Storage**: Supabase PostgreSQL (already configured)

**Testing**: Vitest + Testing Library (already configured)

**Target Platform**: Node.js stdio MCP server (local development)

**Project Type**: MCP Server - local stdio server for AI agent integration

**Performance Goals**:
  - MCP tool 호출: 95%가 2초 이내 응답
  - 배치 업데이트: 100개 이슈 30초 이내 처리
  - GitHub API 호출: 10초 이내 완료

**Constraints**:
  - 배치 작업은 최대 100개 이슈까지 처리
  - GitHub API rate limit 준수
  - MCP 1차 기능과 호환 유지

**Scale/Scope**:
  - 5개 새로운 MCP tool 카테고리
  - 24개 기능 요구사항
  - 5개 사용자 스토리 (P1: 2개, P2: 2개, P3: 1개)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 프로젝트 우선 (Project-First) ✅ PASS
- 모든 기능은 프로젝트 범위 내에서 동작
- 라벨, 멤버, 배치 업데이트는 프로젝트 ID 필수
- GitHub 통합도 프로젝트 설정에 연결

### II. 이슈 중심 설계 (Issue-Centric Design) ✅ PASS
- 모든 기능은 이슈 관리를 보조하거나 자동화
- 라벨은 이슈 분류용
- 배치 업데이트는 이슈 상태 관리용
- GitHub 통합은 개발 워크플로우 연결

### III. 도메인 주도 설계 (Domain-Driven Design) ✅ PASS
- MCP tool → Adapter → Domain Layer → Repository 구조 유지
- 새로운 adapters/ 추가: labels.ts, batch.ts, members.ts, github.ts, tokens.ts
- schemas/에 Zod 스키마 추가
- 도메인 로직은 기존 lib/ 재사용

### IV. 점진적 완성 (Incremental Completeness) ✅ PASS
- P1 (라벨 관리 + 배치 업데이트): 독립적으로 가치 제공
- P2 (멤버 관리 + Access Token UX): 팀 협업 가능
- P3 (GitHub 통합): 개발 워크플로우 자동화
- 각 단계는 이전 단계에 의존하지 않고 독립적

### V. 테스트 주도 개발 (Test-Driven Development) ✅ PASS
- 각 MCP tool은 smoke test로 검증
- adapter 계층은 단위 테스트 작성
- 통합 테스트로 end-to-end 흐름 검증

### VI. 보안과 무결성 (Security & Data Integrity) ✅ PASS
- 모든 작업은 프로젝트 멤버십 검사
- Access Token은 Supabase에 안전 저장
- GitHub PAT는 환경 변수로 관리
- 배치 작업은 트랜잭션 처리

### VII. 설치 가능한 PWA (Installable PWA) ⚠️ N/A
- MCP 서버는 PWA와 무관한 백엔드 기능
- 웹 앱의 Access Token 발급 UI만 PWA와 연동

### VIII. 단순성 유지 (Simplicity) ✅ PASS
- 기존 MCP 구조에 새로운 tool만 추가
- 복잡한 추상화 없이 직접 구현
- YAGNI 원칙에 따라 필요한 기능만 구현

**결과**: 모든 헌법 원칙 준수. 진행 가능 ✅

## Project Structure

### Documentation (this feature)

```text
specs/002-mcp-phase2-features/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── label-tools.ts
│   ├── batch-tools.ts
│   ├── member-tools.ts
│   ├── github-tools.ts
│   └── token-management.ts
└── tasks.md             # Phase 2 output (NOT created by this plan)
```

### Source Code (repository root)

```text
mcp/hinear/
├── src/
│   ├── server.ts                    # Existing - MCP server registration
│   ├── adapters/                    # Existing - Data access layer
│   │   ├── projects.ts              # Existing
│   │   ├── issues.ts                # Existing
│   │   ├── comments.ts              # Existing
│   │   ├── labels.ts                # NEW - Label CRUD
│   │   ├── batch.ts                 # NEW - Batch updates
│   │   ├── members.ts               # NEW - Member management
│   │   ├── github.ts                # NEW - GitHub integration
│   │   └── tokens.ts                # NEW - Token management
│   ├── lib/                         # Existing - Shared utilities
│   │   ├── auth.ts                  # Existing - Authentication
│   │   ├── env.ts                   # Existing - Environment
│   │   ├── supabase.ts              # Existing - Supabase clients
│   │   ├── content.ts               # Existing - Text formatting
│   │   ├── hinear-mappers.ts        # Existing - Domain mappers
│   │   └── github-client.ts         # NEW - GitHub API client
│   ├── schemas/                     # Existing - Zod schemas
│   │   ├── common.ts                # Existing
│   │   ├── project.ts               # Existing
│   │   ├── issue.ts                 # Existing
│   │   ├── comment.ts               # Existing
│   │   ├── label.ts                 # NEW - Label schemas
│   │   ├── batch.ts                 # NEW - Batch operation schemas
│   │   ├── member.ts                # NEW - Member schemas
│   │   └── github.ts                # NEW - GitHub schemas
│   └── tools/                       # Existing - MCP tool registrations
│       ├── list-projects.ts         # Existing
│       ├── search-issues.ts         # Existing
│       ├── get-issue-detail.ts      # Existing
│       ├── create-issue.ts          # Existing
│       ├── update-issue-status.ts   # Existing
│       ├── add-comment.ts           # Existing
│       ├── list-labels.ts           # NEW
│       ├── create-label.ts          # NEW
│       ├── update-label.ts          # NEW
│       ├── delete-label.ts          # NEW
│       ├── batch-update-issues.ts   # NEW
│       ├── list-members.ts          # NEW
│       ├── invite-member.ts         # NEW
│       ├── update-member-role.ts    # NEW
│       ├── remove-member.ts         # NEW
│       ├── create-github-branch.ts  # NEW
│       ├── link-github-issue.ts     # NEW
│       ├── link-github-pr.ts        # NEW
│       └── list-mcp-tokens.ts       # NEW (web app only)
└── scripts/
    ├── login.ts                     # Existing - Login helper
    └── run.ts                       # Existing - Server launcher

src/                                 # Web app (for token management UI)
├── app/
│   ├── settings/
│   │   └── mcp/
│   │       └── page.tsx             # NEW - MCP token management UI
│   └── api/
│       └── mcp/
│           └── tokens/
│               ├── route.ts         # NEW - Token API endpoints
│               ├── issue/route.ts   # NEW - Issue token
│               ├── list/route.ts    # NEW - List tokens
│               └── revoke/route.ts  # NEW - Revoke token
```

**Structure Decision**: 기존 MCP 패키지 구조를 확장합니다. 새로운 adapters/, schemas/, tools/ 파일을 추가하고, 웹 앱에는 Access Token 관리 UI만 추가합니다. 기존 1차 기능과 동일한 아키텍처 패턴을 따릅니다.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | All constitutional principles satisfied |

## Phase 0: Research & Decisions

### Research Tasks

1. **GitHub API Integration Pattern**
   - Task: Research best practices for GitHub API integration in Node.js MCP servers
   - Questions:
     - Which GitHub client library to use? (@octokit/rest or custom fetch)
     - How to handle GitHub API rate limits?
     - How to store GitHub Personal Access Token securely?
     - Webhook vs polling for PR/issue status sync?

2. **Batch Operation Transaction Strategy**
   - Task: Research transaction handling for batch updates in Supabase
   - Questions:
     - Use Supabase RPC or individual queries?
     - How to handle partial failures in batch operations?
     - How to optimize performance for 100 concurrent updates?

3. **Access Token Storage & Security**
   - Task: Research secure token storage patterns in Supabase
   - Questions:
     - Table schema for MCP tokens (hashing algorithm?)
     - Token expiration policy?
     - How to track last used timestamp?
     - Revocation mechanism?

4. **Label Name Collision Handling**
   - Task: Research existing label collision handling in Hinear
   - Questions:
     - Are labels unique within a project?
     - Case-sensitive or case-insensitive?
     - What error to return on duplicate?

5. **Member Invitation Flow**
   - Task: Research existing invitation implementation in Hinear
   - Questions:
     - Is invitations table already implemented?
     - Invitation expiration timeline?
     - How to handle invitation status (pending/accepted/expired)?

### Deliverables

- `research.md` with all decisions and rationale
- Updated Technical Context (resolve all NEEDS CLARIFICATION)
- Technology choices with alternatives considered

## Phase 1: Design & Contracts

### Prerequisites

`research.md` complete with all decisions made

### Data Model (`data-model.md`)

Extract entities from spec:

1. **Label**
   - Fields: id, projectId, name, color (#RRGGBB), description, createdAt, updatedAt
   - Relationships: BelongsTo Project, HasMany Issue (through issue_labels)
   - Validation: name required, color required, unique name per project

2. **BatchOperationResult**
   - Fields: issueId, success, error, timestamp
   - Used for reporting individual results in batch operations

3. **ProjectMember**
   - Fields: id, projectId, userId, role (owner/member), createdAt, updatedAt
   - Relationships: BelongsTo Project, BelongsTo User (profile)
   - Validation: role required, at least one owner per project

4. **Invitation**
   - Fields: id, projectId, email, token, status (pending/accepted/expired), expiresAt, createdAt
   - Relationships: BelongsTo Project
   - Validation: email required, token required, expiresAt required

5. **GitHubIntegration**
   - Fields: id, projectId, githubIssueId, githubPrNumber, branchName, syncedAt
   - Relationships: BelongsTo Project, BelongsTo Issue
   - Validation: At least one GitHub reference required

6. **McpAccessToken**
   - Fields: id, userId, tokenHash, name, lastUsedAt, expiresAt, createdAt, revokedAt
   - Relationships: BelongsTo User (profile)
   - Validation: tokenHash required, name required

### Interface Contracts (`contracts/`)

#### 1. Label Tools (`contracts/label-tools.ts`)

```typescript
// list_labels
interface ListLabelsInput {
  projectId: string;
  limit?: number;
}

interface Label {
  id: string;
  name: string;
  color: string; // #RRGGBB
  description?: string;
  issueCount: number;
}

// create_label
interface CreateLabelInput {
  projectId: string;
  name: string;
  color: string; // #RRGGBB
  description?: string;
}

// update_label
interface UpdateLabelInput {
  labelId: string;
  name?: string;
  color?: string;
  description?: string;
}

// delete_label
interface DeleteLabelInput {
  labelId: string;
}
```

#### 2. Batch Tools (`contracts/batch-tools.ts`)

```typescript
// batch_update_issues
interface BatchUpdateIssuesInput {
  issueIds: string[]; // max 100
  updates: {
    status?: string;
    priority?: string;
    assigneeId?: string;
  };
  commentOnChange?: string;
}

interface BatchUpdateIssuesResult {
  results: Array<{
    issueId: string;
    success: boolean;
    error?: string;
  }>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}
```

#### 3. Member Tools (`contracts/member-tools.ts`)

```typescript
// list_members
interface ListMembersInput {
  projectId: string;
}

interface ProjectMember {
  id: string;
  role: 'owner' | 'member';
  profile: {
    id: string;
    displayName?: string;
    email?: string;
  };
  createdAt: string;
}

// invite_member
interface InviteMemberInput {
  projectId: string;
  email: string;
  role: 'owner' | 'member';
}

interface Invitation {
  id: string;
  email: string;
  role: 'owner' | 'member';
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
}

// update_member_role
interface UpdateMemberRoleInput {
  memberId: string;
  role: 'owner' | 'member';
}

// remove_member
interface RemoveMemberInput {
  memberId: string;
}
```

#### 4. GitHub Tools (`contracts/github-tools.ts`)

```typescript
// create_github_branch
interface CreateGitHubBranchInput {
  issueId: string;
  baseBranch?: string; // default: main
}

interface GitHubBranch {
  name: string;
  url: string;
}

// link_github_issue
interface LinkGitHubIssueInput {
  issueId: string;
  githubIssueUrl: string;
}

interface GitHubIssueLink {
  id: string;
  githubIssueId: number;
  githubIssueUrl: string;
  syncedAt: string;
}

// link_github_pr
interface LinkGitHubPRInput {
  issueId: string;
  githubPrUrl: string;
}

interface GitHubPRLink {
  id: string;
  githubPrNumber: number;
  githubPrUrl: string;
  autoMerge: boolean; // auto-close issue on PR merge
}
```

#### 5. Token Management (`contracts/token-management.ts`)

```typescript
// Web API endpoints (not MCP tools)

// POST /api/mcp/tokens/issue
interface IssueTokenInput {
  name?: string;
  expiresIn?: string; // e.g., "30d", "90d", "never"
}

interface McpAccessToken {
  id: string;
  name: string;
  token: string; // only returned on creation
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// GET /api/mcp/tokens/list
interface ListTokensResponse {
  tokens: Array<{
    id: string;
    name: string;
    lastUsedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
  }>;
}

// POST /api/mcp/tokens/revoke
interface RevokeTokenInput {
  tokenId: string;
}
```

### Quickstart Guide (`quickstart.md`)

Developer onboarding for MCP Phase 2/3 features:

1. **Prerequisites**
   - MCP 1차 기능 이미 설치됨
   - GitHub Personal Access Token (repo scope) - 환경 변수 `GITHUB_TOKEN`
   - Supabase 마이그레이션 실행 (labels, invitations, github_integrations, mcp_access_tokens 테이블)

2. **Setup**
   ```bash
   pnpm install
   pnpm mcp:hinear:login  # 기존과 동일
   pnpm mcp:hinear
   ```

3. **Testing Label Tools**
   ```bash
   # MCP 클라이언트에서
   list_labels({ project_id: "xxx" })
   create_label({ project_id: "xxx", name: "Bug", color: "#ff0000" })
   ```

4. **Testing Batch Updates**
   ```bash
   batch_update_issues({
     issue_ids: ["id1", "id2", "id3"],
     updates: { status: "Done" }
   })
   ```

5. **Testing Member Management**
   ```bash
   list_members({ project_id: "xxx" })
   invite_member({ project_id: "xxx", email: "user@example.com", role: "member" })
   ```

6. **Testing GitHub Integration**
   ```bash
   create_github_branch({ issue_id: "xxx", base_branch: "main" })
   link_github_pr({ issue_id: "xxx", github_pr_url: "https://github.com/..." })
   ```

7. **Testing Token Management (Web App)**
   - 웹 앱 `/settings/mcp` 페이지 방문
   - "MCP Token 발급" 클릭
   - token 복사 또는 로컬 설정에 자동 저장

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` after Phase 1 to update CLAUDE.md with:
- GitHub API client usage
- New MCP tool patterns
- Token security best practices

## Re-evaluate Constitution Check

After Phase 1 design, confirm:
- [ ] GitHub integration doesn't violate "Project-First" (GitHub repo linked to project)
- [ ] Batch operations maintain "Data Integrity" (transaction handling)
- [ ] Token storage follows "Security" principle (hashing, revocation)
- [ ] All new tools follow "DDD" structure (adapter pattern maintained)
