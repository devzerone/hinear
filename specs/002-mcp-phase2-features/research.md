# Research: MCP 2차/3차 기능 확장

**Feature**: MCP Phase 2/3 Features
**Date**: 2026-03-26
**Status**: Complete

## Overview

이 문서는 Hinear MCP 서버의 2차/3차 기능 구현을 위한 기술적 결정과 연구 결과를 기록합니다.

---

## 1. GitHub API Integration Pattern

### Decision: `@octokit/rest` 사용

**Rationale**:
- GitHub 공식 TypeScript 라이브러리
- 자동으로 rate limit handling
- 타입 안전성 보장
- Webhook 지원 확장 용이

**Alternatives Considered**:
1. **Custom fetch implementation**
   - 장점: 의존성 최소화
   - 단점: rate limit handling 직접 구현, 에러 처리 복잡
   - 거부: 유지보스 비용 높음

2. **@octokit/webhooks** (Webhook only)
   - 장점: Webhook 이벤트 처리에 특화
   - 단점: 능동적인 API 호출 불가
   - 거부: 브랜치 생성 등 능동적 호출 필요

**Implementation Details**:

```typescript
// mcp/hinear/src/lib/github-client.ts
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'Hinear-MCP/1.0'
});

// Rate limit handling
// - 기본적으로 octokit이 자동 처리
// - 403 응답 시 재시도 로직 추가
```

**Rate Limit Strategy**:
- GitHub API: 5,000 requests/hour (authenticated)
- 배치 작업 시 parallel requests 제한 (최대 10개 동시)
- Rate limit 초과 시 exponential backoff

**PAT Storage**:
- 환경 변수 `GITHUB_TOKEN`으로 관리
- MCP 서버 시작 시 검증
- 웹 앱 설정 페이지에서 GitHub repo 연결

---

## 2. Batch Operation Transaction Strategy

### Decision: Supabase RPC + Individual Queries

**Rationale**:
- 각 이슈 업데이트는 독립적인 트랜잭션
- 부분 실패 허용 (개별 결과 보고)
- 성능: parallel queries 사용 (최대 10개 동시)

**Alternatives Considered**:
1. **단일 트랜잭션으로 모든 업데이트**
   - 장점: 원자성 보장
   - 단점: 하나의 실패가 전체를 롤백, 타임아웃 위험
   - 거부: 부분 성공이 더 나은 UX

2. **Supabase Edge Function with queue**
   - 장점: 비동기 처리, 대용량 가능
   - 단점: 복잡도 증가, 상태 관리 필요
   - 거부: 100개 제한이므로 동기 처리 충분

**Implementation Details**:

```typescript
// mcp/hinear/src/adapters/batch.ts
async function batchUpdateIssues(
  issueIds: string[],
  updates: IssueUpdates
): Promise<BatchResult> {
  const results = await Promise.allSettled(
    issueIds.map(id => updateSingleIssue(id, updates))
  );

  return results.map((result, index) => ({
    issueId: issueIds[index],
    success: result.status === 'fulfilled',
    error: result.status === 'rejected' ? result.reason.message : undefined
  }));
}
```

**Performance Optimization**:
- Parallel queries: 10개씩 묶어서 처리
- 각 쿼리는 개별 트랜잭션
- 100개 이슈 기준 예상 시간: 10-20초

---

## 3. Access Token Storage & Security

### Decision: Supabase Table + SHA-256 Hashing

**Rationale**:
- Supabase Row Level Security (RLS)로 접근 제어
- SHA-256 해싱으로 token 안전 저장
- 자체 관리로 외부 의존성 최소화

**Alternatives Considered**:
1. **JWT without storage**
   - 장점: 무상태, 데이터베이스 쿼리 불필요
   - 단점: revoke 불가능, 추적 어려움
   - 거부: token 관리 기능 필요

2. **Redis cache**
   - 장점: 빠른 조회, TTL 지원
   - 단점: 외부 의존성, 인프라 비용
   - 거부: 과한 엔지니어링

**Table Schema**:

```sql
CREATE TABLE mcp_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE mcp_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
  ON mcp_access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
  ON mcp_access_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can revoke own tokens"
  ON mcp_access_tokens FOR UPDATE
  USING (auth.uid() = user_id);
```

**Token Lifecycle**:
- **발급**: SHA-256 해시 저장, 원본 token은 한 번만 반환
- **사용**: MCP 요청 시 token으로 hash 조회, `last_used_at` 업데이트
- **만료**: `expires_at < NOW()` 자동 만료, `revoked_at IS NOT NULL` 즉시 만료
- **취소**: `revoked_at` 설정

**Security Measures**:
- Token 길이: 64 bytes (cryptographically random)
- Hashing: SHA-256 (단방향)
- RLS로 사용자별 접근 제한
- HTTPS로만 전송 (웹 앱)

---

## 4. Label Name Collision Handling

### Decision: Case-insensitive unique within project

**Rationale**:
- 사용자 경험: "Bug"와 "bug"를 다른 라벨로 인식하면 혼란
- 데이터베이스: `LOWER(name)`에 unique index
- 에러 메시지: 명확한 중복 안내

**Alternatives Considered**:
1. **Case-sensitive unique**
   - 장점: 구현 단순
   - 단점: 사용자 혼란, 의도치 않은 중복
   - 거부: UX 저하

2. **Duplicate allowed**
   - 장점: 제약 없음
   - 단점: 검색/필터 복잡, 혼란
   - 거부: 데이터 정합성 저하

**Implementation Details**:

```sql
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, LOWER(name))
);
```

**Error Handling**:
```typescript
if (labelExists) {
  throw new MCPError(
    "LABEL_ALREADY_EXISTS",
    `Label "${name}" already exists in this project (case-insensitive)`
  );
}
```

---

## 5. Member Invitation Flow

### Decision: 기존 invitations 테이블 활용

**Rationale**:
- Hinear에 이미 invitations 테이블 존재 (가정)
- MCP가 같은 흐름 재사용
- 일관된 사용자 경험

**기존 invitations 스키마** (가정):
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**만약 invitations 테이블이 없다면**:
- Phase 1에서 마이그레이션 추가
- MCP와 웹 앱 모두 사용

**Invitation Flow**:
1. **초대 생성**: `invite_member` tool 호출
   - `invitations` 테이블에 row 생성
   - email로 초대 링크 전송 (기존 웹 앱 로직 재사용)
   - 7일 유효기간

2. **초대 수락**: 사용자가 링크 클릭
   - 웹 앱에서 `project_members`에 row 추가
   - `invitations.status` → 'accepted'

3. **초대 취소**: `remove_member`로 pending 초대 삭제
   - `invitations.status` → 'revoked'

---

## 6. Additional Technical Decisions

### 6.1. Label Color Format

**Decision**: Hex 코드 `#RRGGBB` (Zod validation)

**Rationale**:
- 웹 표준
- CSS color 그대로 사용 가능
- 색상 picker 통합 용이

**Validation**:
```typescript
const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format");
```

### 6.2. Batch Operation Limit

**Decision**: 최대 100개 이슈

**Rationale**:
- 성능: 100개면 10-20초 내 처리
- UX: 대부분의 배치 작업 충족
- Error: 너무 많으면 timeout 위험

**Validation**:
```typescript
if (issueIds.length > 100) {
  throw new MCPError("TOO_MANY_ISSUES", "Maximum 100 issues per batch");
}
```

### 6.3. GitHub Webhook vs Polling

**Decision**: Phase 2에서는 Webhook 미구현, 추후 확장

**Rationale**:
- Webhook: 공개 endpoint 필요, 복잡도 높음
- 현재는 manual link로 충분
- Phase 3에서 Webhook 추가 가능

**Phase 2 (현재)**:
- 수동으로 GitHub PR/issue 연결
- PR merged 시 자동 상태 변경 ❌ (추후)

**Phase 3 (향후)**:
- Webhook endpoint: `/api/github/webhooks`
- PR merged → 이슈 상태 자동 변경 ✅

---

## Summary of Decisions

| Area | Decision | Key Alternatives Rejected |
|------|----------|---------------------------|
| GitHub Client | `@octokit/rest` | Custom fetch, @octokit/webhooks |
| Batch Transactions | Parallel individual queries | Single transaction, Edge Function |
| Token Storage | Supabase + SHA-256 | JWT stateless, Redis cache |
| Label Uniqueness | Case-insensitive per project | Case-sensitive, duplicates allowed |
| Invitation Flow | Reuse existing invitations table | Custom MCP-only flow |
| Label Color | Hex #RRGGBB | RGB array, named colors |
| Batch Limit | 100 issues max | Unlimited, 10/50/1000 |
| GitHub Sync | Manual link only | Webhook auto-sync (deferred) |

---

## Open Questions (Resolved)

All questions from Phase 0 have been resolved. No remaining NEEDS CLARIFICATION items.

---

## Next Steps

1. ✅ Research complete
2. → Phase 1: Create data-model.md
3. → Phase 1: Define contracts/
4. → Phase 1: Write quickstart.md
5. → Phase 1: Update agent context
