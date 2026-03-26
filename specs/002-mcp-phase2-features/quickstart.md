# Quickstart Guide: MCP 2차/3차 기능

**Feature**: MCP Phase 2/3 Features
**Date**: 2026-03-26
**Audience**: Developers implementing or testing MCP Phase 2/3 features

## Overview

이 가이드는 Hinear MCP 서버의 2차/3차 기능을 빠르게 설정하고 테스트하는 방법을 안내합니다.

---

## Prerequisites

1. **MCP 1차 기능 이미 설치됨**
   - 7개 핵심 tool (list_projects, search_issues 등)
   - 로컬 MCP 서버 실행 가능

2. **GitHub Personal Access Token** (GitHub 통합용)
   - GitHub에서 발급: Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 필요 권한: `repo` (full repository access)
   - 환경 변수 설정: `GITHUB_TOKEN`

3. **Supabase 마이그레이션 실행**
   - labels, invitations, github_integrations, mcp_access_tokens 테이블
   - (마이그레이션 스크립트는 `data-model.md` 참조)

---

## Setup

### 1. 의존성 설치

```bash
pnpm install
```

새로운 의존성 추가:
```bash
pnpm add @octokit/rest
```

### 2. 환경 변수 설정

```bash
pnpm mcp:hinear:login
```

필요한 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN` (GitHub 통합용)
- `HINEAR_MCP_ACCESS_TOKEN` 또는 `HINEAR_MCP_USER_ID`

### 3. 데이터베이스 마이그레이션

```bash
# Supabase 마이그레이션 실행 (아직 구현되지 않은 경우)
supabase migration up --file migrations/002_phase2_tables.sql
```

또는 Supabase Dashboard에서 SQL 실행:
1. Supabase 프로젝트 → SQL Editor
2. `data-model.md`의 마이그레이션 스크립트 복사/붙여넣기
3. Run

### 4. MCP 서버 시작

```bash
pnpm mcp:hinear
```

서버가 stdio로 시작되고 MCP 클라이언트가 연결을 대기합니다.

---

## Testing Label Tools

### 1. 라벨 목록 조회

```typescript
// MCP 클라이언트에서
const result = await mcp.call_tool("list_labels", {
  project_id: "your-project-id"
});

console.log(result);
```

**Expected Output**:
```json
{
  "labels": [
    {
      "id": "...",
      "name": "Bug",
      "color": "#ff0000",
      "description": "버그 리포트",
      "issue_count": 12
    }
  ],
  "total": 1
}
```

### 2. 라벨 생성

```typescript
const result = await mcp.call_tool("create_label", {
  project_id: "your-project-id",
  name: "Feature",
  color: "#00ff00",
  description: "새로운 기능"
});
```

### 3. 라벨 수정

```typescript
const result = await mcp.call_tool("update_label", {
  label_id: "label-id",
  color: "#0000ff"
});
```

### 4. 라벨 삭제

```typescript
const result = await mcp.call_tool("delete_label", {
  label_id: "label-id"
});
```

---

## Testing Batch Updates

### 1. 배치 상태 변경

```typescript
const result = await mcp.call_tool("batch_update_issues", {
  issue_ids: ["id1", "id2", "id3"],
  updates: {
    status: "Done"
  },
  comment_on_change: "배치로 완료했습니다."
});
```

**Expected Output**:
```json
{
  "results": [
    { "issue_id": "id1", "success": true },
    { "issue_id": "id2", "success": true },
    { "issue_id": "id3", "success": false, "error": "Issue not found" }
  ],
  "summary": {
    "total": 3,
    "succeeded": 2,
    "failed": 1
  },
  "duration_ms": 1523
}
```

### 2. 배치 담당자 변경

```typescript
const result = await mcp.call_tool("batch_update_issues", {
  issue_ids: ["id1", "id2", "id3"],
  updates: {
    assignee_id: "user-id"
  }
});
```

---

## Testing Member Management

### 1. 멤버 목록 조회

```typescript
const result = await mcp.call_tool("list_members", {
  project_id: "your-project-id"
});
```

### 2. 멤버 초대

```typescript
const result = await mcp.call_tool("invite_member", {
  project_id: "your-project-id",
  email: "newuser@example.com",
  role: "member"
});
```

**Expected Output**:
```json
{
  "invitation": {
    "id": "...",
    "email": "newuser@example.com",
    "role": "member",
    "status": "pending",
    "expires_at": "2026-04-02T10:00:00Z"
  },
  "invite_url": "https://hinear.app/invitations/abc123token"
}
```

### 3. 역할 변경

```typescript
const result = await mcp.call_tool("update_member_role", {
  member_id: "member-id",
  role: "owner"
});
```

### 4. 멤버 제거

```typescript
const result = await mcp.call_tool("remove_member", {
  member_id: "member-id"
});
```

---

## Testing GitHub Integration

### Prerequisites

GitHub Personal Access Token 설정:
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### 1. 브랜치 생성

```typescript
const result = await mcp.call_tool("create_github_branch", {
  issue_id: "your-issue-id",
  base_branch: "main"
});
```

**Expected Output**:
```json
{
  "branch": {
    "name": "WEB-123-add-user-authentication",
    "url": "https://github.com/owner/repo/tree/WEB-123-add-user-authentication",
    "issue_id": "...",
    "issue_identifier": "WEB-123"
  }
}
```

### 2. GitHub 이슈 연결

```typescript
const result = await mcp.call_tool("link_github_issue", {
  issue_id: "your-issue-id",
  github_issue_url: "https://github.com/owner/repo/issues/123"
});
```

### 3. GitHub PR 연결

```typescript
const result = await mcp.call_tool("link_github_pr", {
  issue_id: "your-issue-id",
  github_pr_url: "https://github.com/owner/repo/pull/456",
  auto_merge: true
});
```

---

## Testing Token Management (Web App)

### 1. Token 발급 페이지 접속

1. 웹 앱 실행: `pnpm dev`
2. 브라우저에서: `http://localhost:3000/settings/mcp`
3. "MCP Token 발급" 버튼 클릭

### 2. Token 발급

```typescript
// POST /api/mcp/tokens/issue
const response = await fetch('/api/mcp/tokens/issue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "My Laptop",
    expires_in: "90d"
  })
});

const data = await response.json();
console.log(data.token.token); // 원본 token (복사 필요)
```

### 3. Token 목록 조회

```typescript
// GET /api/mcp/tokens/list
const response = await fetch('/api/mcp/tokens/list');
const data = await response.json();
console.log(data.tokens);
```

### 4. Token 취소

```typescript
// POST /api/mcp/tokens/revoke
const response = await fetch('/api/mcp/tokens/revoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token_id: "token-id"
  })
});
```

### 5. 로컬 설정에 저장

"로컬 설정에 저장" 버튼 클릭 → `.env.local` 파일 다운로드:

```bash
# 다운로드한 파일을:
mv ~/Downloads/.env.local mcp/hinear/.env.local
```

---

## Smoke Testing

### 자동화된 smoke test

```bash
# 전체 smoke test (read + write)
pnpm mcp:hinear:smoke --write

# 또는 수동으로 각 기능 테스트
```

### 수동 smoke test 체크리스트

- [ ] **Labels**: list → create → update → delete
- [ ] **Batch**: 3개 이슈 배치 상태 변경
- [ ] **Members**: list → invite → update role → remove
- [ ] **GitHub**: create branch → link issue → link PR
- [ ] **Tokens**: issue → list → revoke

---

## Troubleshooting

### Label 생성 실패: "LABEL_ALREADY_EXISTS"

**문제**: 같은 이름의 라벨이 이미 있음
**해결**: 다른 이름 사용 또는 기존 라벨 수정

### Batch 업데이트 느림

**문제**: 100개 이슈에 30초 이상 소요
**해결**:
- Network latency 확인
- Supabase connection pool 확인
- Parallelism 줄이기 (adapter에서)

### GitHub API 403 Forbidden

**문제**: Rate limit 초과
**해결**:
- 1시간 후 다시 시도
- `GITHUB_TOKEN` 권한 확인

### Token 발급 실패: 401 Unauthorized

**문제**: Supabase 인증 실패
**해결**:
- 로그인되어 있는지 확인
- `access_token`이 유효한지 확인

---

## Next Steps

1. **구현**: `/speckit.tasks`로 구현 작업 생성
2. **테스트**: 각 tool별 단위 테스트 작성
3. **문서**: API 문서 업데이트
4. **배포**: MCP 패키지 버전 업 (0.2.0)

---

## Resources

- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/](./contracts/)
- **Research**: [research.md](./research.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Feature Spec**: [spec.md](./spec.md)
