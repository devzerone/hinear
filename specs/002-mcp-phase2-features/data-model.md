# Data Model: MCP 2차/3차 기능 확장

**Feature**: MCP Phase 2/3 Features
**Date**: 2026-03-26
**Status**: Complete

## Overview

이 문서는 Hinear MCP 서버의 2차/3차 기능을 위한 데이터 모델을 정의합니다. 기존 Hinear 도메인 모델을 확장하며, 새로운 엔티티와 관계를 추가합니다.

---

## Existing Entities (from MVP 1)

기존 엔티티는 MCP 1차에서 이미 사용 중입니다:

- **Project**: 최상위 경계 (personal/team)
- **Issue**: 프로젝트에 속한 이슈
- **ProjectMember**: 프로젝트 멤버 (owner/member)
- **Comment**: 이슈 코멘트
- **ActivityLog**: 활동 로그

---

## New Entities

### 1. Label

프로젝트 내 이슈 분류용 태그.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | 라벨 고유 ID |
| `project_id` | UUID | FK → projects.id, NOT NULL | 소속 프로젝트 |
| `name` | TEXT | NOT NULL, case-insensitive unique with project_id | 라벨 이름 |
| `color` | TEXT | NOT NULL, regex `^#[0-9A-Fa-f]{6}$` | 색상 (hex 코드) |
| `description` | TEXT | nullable | 라벨 설명 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 수정 시각 |

**Relationships**:
- **BelongsTo**: Project (many labels → one project)
- **HasMany**: Issue (through issue_labels join table)

**Validation Rules**:
1. `name`은 프로젝트 내에서 대소문자 구분 없이 유일
2. `color`는 유효한 hex 색상 코드여야 함
3. 라벨 삭제 시 연결된 이슈에서 자동으로 제거 (CASCADE)

**Indexes**:
- `UNIQUE(project_id, LOWER(name))` - 중복 방지
- `INDEX(project_id)` - 프로젝트별 조회 최적화

---

### 2. BatchOperationResult

배치 작업의 개별 결과 (임시 테이블, 실제 저장 안 함).

**Fields** (in-memory only):
| Field | Type | Description |
|-------|------|-------------|
| `issue_id` | string | 대상 이슈 ID |
| `success` | boolean | 성공 여부 |
| `error` | string \| null | 에러 메시지 (실패 시) |

**Usage**:
- 배치 작업 결과를 MCP 클라이언트에 반환
- 데이터베이스에는 저장하지 않음

---

### 3. Invitation (if not exists)

프로젝트 초대 (기존 테이블이 있다면 재사용).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | 초대 고유 ID |
| `project_id` | UUID | FK → projects.id, NOT NULL | 대상 프로젝트 |
| `email` | TEXT | NOT NULL | 초대받을 이메일 |
| `role` | TEXT | NOT NULL, CHECK IN ('owner', 'member') | 역할 |
| `token` | TEXT | UNIQUE, NOT NULL | 초대 수락 토큰 |
| `status` | TEXT | NOT NULL, CHECK IN ('pending', 'accepted', 'expired', 'revoked'), DEFAULT 'pending' | 상태 |
| `expires_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() + 7 days | 만료 시각 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 생성 시각 |

**Relationships**:
- **BelongsTo**: Project
- **BelongsTo**: User (email → profiles.email_normalized, when accepted)

**Validation Rules**:
1. 같은 이메일로 같은 프로젝트에 중복 초대 불가 (pending 상태)
2. 만료된 초대는 수락 불가
3. 소유자는 자신을 초대할 수 없음

**State Transitions**:
```
pending → accepted (사용자가 링크 클릭)
pending → expired (7일 경과)
pending → revoked (취소)
```

---

### 4. GitHubIntegration

Hinear 이슈와 GitHub 리소스 간 연결.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | 통합 고유 ID |
| `project_id` | UUID | FK → projects.id, NOT NULL | 소속 프로젝트 |
| `issue_id` | UUID | FK → issues.id, NOT NULL | 연결된 이슈 |
| `github_issue_id` | INTEGER | nullable | GitHub 이슈 번호 |
| `github_pr_number` | INTEGER | nullable | GitHub PR 번호 |
| `github_repo_full_name` | TEXT | nullable | GitHub 리포지토리 (owner/repo) |
| `branch_name` | TEXT | nullable | 생성된 브랜치 이름 |
| `auto_merge` | BOOLEAN | DEFAULT false | PR merge 시 이슈 자동 닫기 |
| `synced_at` | TIMESTAMPTZ | DEFAULT NOW() | 동기화 시각 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 생성 시각 |

**Relationships**:
- **BelongsTo**: Project
- **BelongsTo**: Issue

**Validation Rules**:
1. `github_issue_id`, `github_pr_number`, `branch_name` 중 최소 하나 필요
2. 같은 이슈에 중복된 GitHub 리소스 연결 불가
3. `github_repo_full_name`은 프로젝트 설정에서 관리

**Indexes**:
- `UNIQUE(issue_id, github_issue_id)` - 이슈-GitHub 이슈 중복 방지
- `UNIQUE(issue_id, github_pr_number)` - 이슈-GitHub PR 중복 방지
- `INDEX(github_pr_number)` - Webhook에서 PR 조회 최적화 (향후)

---

### 5. McpAccessToken

웹 앱에서 발급하는 MCP 전용 인증 토큰.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | 토큰 고유 ID |
| `user_id` | UUID | FK → public.profiles(id), NOT NULL | 소유자 |
| `token_hash` | TEXT | UNIQUE, NOT NULL | SHA-256 해시 |
| `name` | TEXT | NOT NULL | 토큰 이름 (사용자 지정) |
| `last_used_at` | TIMESTAMPTZ | nullable | 마지막 사용 시각 |
| `expires_at` | TIMESTAMPTZ | nullable | 만료 시각 (null = 영구) |
| `revoked_at` | TIMESTAMPTZ | nullable | 취소 시각 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 생성 시각 |

**Relationships**:
- **BelongsTo**: User (profile)

**Validation Rules**:
1. `token_hash`는 유일해야 함
2. 만료되지 않은 토큰만 사용 가능 (`expires_at > NOW()` OR `expires_at IS NULL`)
3. 취소된 토큰은 사용 불가 (`revoked_at IS NULL`)

**Security**:
- Token 길이: 64 bytes (cryptographically random)
- Hashing: SHA-256 (단방향)
- RLS: 사용자는 자신의 토큰만 조회/관리 가능

**Indexes**:
- `UNIQUE(token_hash)` - 중복 방지
- `INDEX(user_id)` - 사용자별 조회 최적화

---

## Entity Relationships (ER Diagram)

```
Project (1) ───< (N) Label
  │
  ├── (1) ───< (N) Issue
  │                │
  │                ├── (N) ───< (M) Label (through issue_labels)
  │                │
  │                └── (1) ───< (N) GitHubIntegration
  │
  ├── (1) ───< (N) ProjectMember
  │
  └── (1) ───< (N) Invitation
                │
                └── (1) → User (when accepted)

User (profile)
  │
  └── (1) ───< (N) McpAccessToken
```

---

## Data Access Patterns

### Label Operations

```typescript
// List labels
SELECT * FROM labels
WHERE project_id = $1
ORDER BY name;

// Create label
INSERT INTO labels (project_id, name, color, description)
VALUES ($1, $2, $3, $4)
RETURNING *;

// Update label
UPDATE labels
SET name = $2, color = $3, description = $4, updated_at = NOW()
WHERE id = $1
RETURNING *;

// Delete label (CASCADE to issue_labels)
DELETE FROM labels
WHERE id = $1;
```

### Batch Update Operations

```typescript
// Parallel updates (in application code)
const results = await Promise.allSettled(
  issueIds.map(id =>
    updateIssue(id, updates, commentOnChange)
  )
);

// Each update:
UPDATE issues
SET status = $2, priority = $3, assignee_id = $4, updated_at = NOW()
WHERE id = $1
RETURNING *;

// Activity log for each
INSERT INTO activity_logs (issue_id, actor_id, field, from, to)
VALUES ($1, $2, 'status', $3, $4);
```

### Member Operations

```typescript
// List members
SELECT pm.*, p.display_name, p.email
FROM project_members pm
JOIN profiles p ON pm.user_id = p.id
WHERE pm.project_id = $1
ORDER BY pm.created_at;

// Invite member
INSERT INTO invitations (project_id, email, role, token)
VALUES ($1, $2, $3, $4)
RETURNING *;

// Update role
UPDATE project_members
SET role = $2
WHERE id = $1
RETURNING *;

// Remove member (or revoke invitation)
DELETE FROM project_members
WHERE id = $1;

-- OR

UPDATE invitations
SET status = 'revoked'
WHERE id = $1;
```

### GitHub Integration Operations

```typescript
// Create branch (via GitHub API, then store)
INSERT INTO github_integrations (project_id, issue_id, branch_name, github_repo_full_name)
VALUES ($1, $2, $3, $4)
RETURNING *;

// Link GitHub issue
INSERT INTO github_integrations (project_id, issue_id, github_issue_id, github_repo_full_name)
VALUES ($1, $2, $3, $4)
RETURNING *;

// Link GitHub PR
INSERT INTO github_integrations (project_id, issue_id, github_pr_number, github_repo_full_name, auto_merge)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

// Query linked resources
SELECT gi.*
FROM github_integrations gi
WHERE gi.issue_id = $1;
```

### Token Operations

```typescript
// Issue token (web app)
INSERT INTO mcp_access_tokens (user_id, token_hash, name, expires_at)
VALUES ($1, $2, $3, $4)
RETURNING *;

// List tokens (web app)
SELECT id, name, last_used_at, expires_at, created_at
FROM mcp_access_tokens
WHERE user_id = $1
  AND revoked_at IS NULL
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY created_at DESC;

// Verify token (MCP server)
SELECT *
FROM mcp_access_tokens
WHERE token_hash = $1
  AND revoked_at IS NULL
  AND (expires_at IS NULL OR expires_at > NOW());

// Update last used
UPDATE mcp_access_tokens
SET last_used_at = NOW()
WHERE id = $1;

// Revoke token
UPDATE mcp_access_tokens
SET revoked_at = NOW()
WHERE id = $1 AND user_id = $2;
```

---

## Migration Scripts

### Phase 2 Migration (if tables don't exist)

```sql
-- Labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, LOWER(name))
);

CREATE INDEX IF NOT EXISTS idx_labels_project_id ON labels(project_id);

-- Issue-labels join table (if not exists)
CREATE TABLE IF NOT EXISTS issue_labels (
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, label_id)
);

-- Invitations table (if not exists)
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, email, status) FILTER (WHERE status = 'pending')
);

CREATE INDEX IF NOT EXISTS idx_invitations_project_id ON invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- GitHub integrations table
CREATE TABLE IF NOT EXISTS github_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  github_issue_id INTEGER,
  github_pr_number INTEGER,
  github_repo_full_name TEXT,
  branch_name TEXT,
  auto_merge BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (issue_id, github_issue_id) FILTER (WHERE github_issue_id IS NOT NULL),
  UNIQUE (issue_id, github_pr_number) FILTER (WHERE github_pr_number IS NOT NULL),
  CHECK (
    (github_issue_id IS NOT NULL) OR
    (github_pr_number IS NOT NULL) OR
    (branch_name IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_github_integrations_project_id ON github_integrations(project_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_issue_id ON github_integrations(issue_id);
CREATE INDEX IF NOT EXISTS idx_github_integrations_pr_number ON github_integrations(github_pr_number) FILTER (WHERE github_pr_number IS NOT NULL);

-- MCP access tokens table
CREATE TABLE IF NOT EXISTS mcp_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcp_access_tokens_user_id ON mcp_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_access_tokens_token_hash ON mcp_access_tokens(token_hash);

-- RLS for MCP tokens
ALTER TABLE mcp_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own active MCP tokens"
  ON mcp_access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MCP tokens"
  ON mcp_access_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can revoke own MCP tokens"
  ON mcp_access_tokens FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Summary

이 데이터 모델은 다음을 보장합니다:

1. **프로젝트 우선**: 모든 엔티티는 프로젝트에 종속
2. **데이터 무결성**: Foreign key, unique constraints, CHECK 제약조건
3. **보안**: RLS로 접근 제어, token 해싱
4. **확장성**: 향후 Webhook, 추가 필더 대비
5. **성능**: 적절한 인덱스로 조회 최적화

다음 단계: `contracts/` 디렉토리에 인터페이스 계약 정의
