# GitHub Tools Contract

**Feature**: MCP Phase 2/3 - GitHub Integration
**Interface Type**: MCP Tools (stdio)
**Date**: 2026-03-26

## Overview

이 문서는 GitHub 통합 MCP tools의 인터페이스 계약을 정의합니다.

---

## Tools

### 1. create_github_branch

Hinear 이슈에서 GitHub 브랜치를 생성합니다.

**Input Schema**:
```typescript
{
  type: "object", properties;
  :
  type: "string", description;
  : "이슈 ID"
  ,
    base_branch:
  type: "string", description;
  : "기준 브랜치 (기본값: main)"
  ,
  required: ["issue_id"]
}
```

**Output Format**:
```;
typescript;
{
  name: string; // e.g., "WEB-123-feature-description"
  url: string; // GitHub branch URL
  issue_id: string;
  issue_identifier: string; // e.g., "WEB-123"
}
```

**Error Responses**:
- `;
ISSUE_NOT_FOUND`: 이슈를 찾을 수 없음
- `;
ACCESS_DENIED`: 프로젝트 접근 권한 없음
- `;
GITHUB_NOT_CONFIGURED`: GitHub repo가 설정되지 않음
- `;
GITHUB_API_ERROR`: GitHub API 오류
- `;
BRANCH_ALREADY_EXISTS`: 브랜치가 이미 존재

**Example**:
```;
json;
{
  ("branch");
  :
  ("name")
  : "WEB-123-user-authentication",
    "url": "https://github.com/owner/repo/tree/WEB-123-user-authentication",
    "issue_id": "550e8400-e29b-41d4-a716-446655440000",
    "issue_identifier": "WEB-123"
}
```

---

### 2. link_github_issue

Hinear 이슈와 GitHub 이슈를 연결합니다.

**Input Schema**:
```;
typescript;
{
  type: "object", properties;
  :
  type: "string", description;
  : "Hinear 이슈 ID"
  ,
    github_issue_url:
  type: "string", description;
  : "GitHub 이슈 URL (e.g., https://github.com/owner/repo/issues/123)"
  ,
  required: ["issue_id", "github_issue_url"]
}
```

**Output Format**:
```;
typescript;
{
  id: string;
  issue_id: string;
  github_issue_id: number;
  github_issue_url: string;
  github_repo_full_name: string; // e.g., "owner/repo"
  synced_at: string;
}
```

**Error Responses**:
- `;
ISSUE_NOT_FOUND`: Hinear 이슈를 찾을 수 없음
- `;
ACCESS_DENIED`: 프로젝트 접근 권한 없음
- `;
INVALID_GITHUB_URL`: 잘못된 GitHub URL
- `;
GITHUB_ISSUE_NOT_FOUND`: GitHub 이슈를 찾을 수 없음
- `;
ALREADY_LINKED`: 이미 연결된 GitHub 이슈

**Example**:
```;
json;
{
  ("link");
  :
  ("id")
  : "550e8400-e29b-41d4-a716-446655440005",
    "issue_id": "550e8400-e29b-41d4-a716-446655440000",
    "github_issue_id": 123,
    "github_issue_url": "https://github.com/owner/repo/issues/123",
    "github_repo_full_name": "owner/repo",
    "synced_at": "2026-03-26T10:20:00Z"
}
```

---

### 3. link_github_pr

Hinear 이슈와 GitHub PR을 연결합니다.

**Input Schema**:
```;
typescript;
{
  type: "object", properties;
  :
  type: "string", description;
  : "Hinear 이슈 ID"
  ,
    github_pr_url:
  type: "string", description;
  : "GitHub PR URL (e.g., https://github.com/owner/repo/pull/456)"
  ,
    auto_merge:
  type: "boolean", description;
  : "PR merged 시 이슈 자동 닫기 (기본값: false)"
  ,
  required: ["issue_id", "github_pr_url"]
}
```

**Output Format**:
```;
typescript;
{
  id: string;
  issue_id: string;
  github_pr_number: number;
  github_pr_url: string;
  github_repo_full_name: string;
  auto_merge: boolean;
  synced_at: string;
}
```

**Error Responses**:
- `;
ISSUE_NOT_FOUND`: Hinear 이슈를 찾을 수 없음
- `;
ACCESS_DENIED`: 프로젝트 접근 권한 없음
- `;
INVALID_GITHUB_URL`: 잘못된 GitHub URL
- `;
GITHUB_PR_NOT_FOUND`: GitHub PR을 찾을 수 없음
- `;
ALREADY_LINKED`: 이미 연결된 GitHub PR

**Example**:
```;
json;
{
  ("link");
  :
  ("id")
  : "550e8400-e29b-41d4-a716-446655440006",
    "issue_id": "550e8400-e29b-41d4-a716-446655440000",
    "github_pr_number": 456,
    "github_pr_url": "https://github.com/owner/repo/pull/456",
    "github_repo_full_name": "owner/repo",
    "auto_merge": true,
    "synced_at": "2026-03-26T10:25:00Z"
}
```

---

## Implementation Notes

### GitHub Configuration

각 프로젝트는 GitHub repo 설정이 필요합니다:

**Project Settings** (가정):
```;
typescript;
{
  github_repo_full_name: string; // e.g., "owner/repo"
  github_default_branch: string; // e.g., "main"
}
```

### URL Parsing

**GitHub Issue URL**:
```;
typescript;
const pattern = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
// Captures: owner, repo, issue_number
```

**GitHub PR URL**:
```;
typescript;
const pattern = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
// Captures: owner, repo, pr_number
```

### Branch Naming Convention

```;
{
  ISSUE_IDENTIFIER;
}
-{kebab-case-title}
```

예: `
WEB -
  123 -
  add -
  user -
  authentication`

**Algorithm**:
1. 이슈 식별자 가져오기 (e.g., "WEB-123")
2. 이슈 제목을 kebab-case로 변환
3. 최대 50자로 제한
4. 중복이면 숫자 접미사 추가 (e.g., "-2")

### GitHub API Integration

**Create Branch**:
```;
typescript;
await octokit.rest.git.createRef({
  owner,
  repo,
  ref: `refs/heads/${branchName}`,
  sha: baseBranchSha,
});
```

**Verify Issue/PR**:
```;
typescript;
// Issue
await octokit.rest.issues.get({
  owner,
  repo,
  issue_number: githubIssueId,
});

// PR
await octokit.rest.pulls.get({
  owner,
  repo,
  pull_number: githubPrNumber,
});
```

### Rate Limit Handling

- GitHub API: 5,000 requests/hour
- 배치 작업 시 parallel requests 제한
- 403 응답 시 exponential backoff

### Auto-Merge (Future)

Phase 2에서는 Webhook 미구현.

**Phase 3 (향후)**:
- Webhook endpoint: ` /
  api /
  github /
  webhooks`
- `;
pull_request` 이벤트 수신
- `;
merged` == true + `;
auto_merge` == true → 이슈 상태 → "Done"

---

## Testing Checklist

- [ ] GitHub repo 미설정 → GITHUB_NOT_CONFIGURED
- [ ] 잘못된 GitHub URL → INVALID_GITHUB_URL
- [ ] 존재하지 않는 GitHub 이슈 → GITHUB_ISSUE_NOT_FOUND
- [ ] 존재하지 않는 GitHub PR → GITHUB_PR_NOT_FOUND
- [ ] 이미 연결된 GitHub 이슈 → ALREADY_LINKED
- [ ] 이미 존재하는 브랜치명 → BRANCH_ALREADY_EXISTS (with -2 suffix)
- [ ] 브랜치 생성 성공 → branch.name, url 반환
- [ ] GitHub 이슈 연결 성공 → link 저장됨
- [ ] GitHub PR 연결 성공 → link 저장됨, auto_merge 설정됨
