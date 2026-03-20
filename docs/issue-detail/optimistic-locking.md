# 낙관적 잠금 (Optimistic Locking) 구현 가이드

## 목적

실시간 동시 편집 환경에서 데이터 무결성을 보장하면서 사용자 경험을 개선하기 위해 낙관적 잠금을 구현한다.

---

## 개요

### 낙관적 잠금이란?

**기본 아이디어:**
- 사용자가 데이터를 읽을 때 **버전 번호**를 함께 제공
- 수정 후 저장할 때 **버전이 변경되었는지 확인**
- 버전이 맞으면 저장, 틀리면 충돌 에러 반환

**장점:**
- ✅ 잠금 방식보다 사용자 경험 좋음
- ✅ 데이터 손실 없음
- ✅ 구현 상대적으로 쉬움
- ✅ 데이터베이스 부하 적음

**단점:**
- ❌ 저장 시 충돌 가능
- ❌ 사용자가 재작업해야 할 수 있음

---

## 시나리오 예시

### 충돌 상황

```
1. Alice가 이슈 #42 조회
   → title: "버그 수정"
   → version: 5

2. Bob이 이슈 #42 조회
   → title: "버그 수정"
   → version: 5

3. Alice가 제목 수정 후 저장
   PUT /issues/42
   {
     title: "버그 수정 완료",
     version: 5  # 읽은 시점의 버전
   }
   → 성공! version: 6으로 증가

4. Bob이 제목 수정 후 저장
   PUT /issues/42
   {
     title: "버그 수정 중",
     version: 5  # 여전히 version: 5
   }
   → 충돌 에러! 현재 version은 6
```

### 충돌 해결 UI

```
┌─────────────────────────────────┐
│ ⚠️ 변경 사항이 있습니다          │
│                                 │
│ Alice가 이 이슈를 변경했습니다:  │
│ - 제목: "버그 수정 완료"        │
│ - 상태: Todo → In Progress      │
│                                 │
│ [최신 버전 다시 로드]           │
│ [내 변경 내용 보기]             │
│ [계속 편집하기]                 │
└─────────────────────────────────┘
```

---

## 데이터베이스 스키마

### 1. issues 테이블에 version 컬럼 추가

```sql
-- 기존 issues 테이블에 version 추가
alter table public.issues
add column version integer not null default 1;

-- version 컬럼 인덱스
create index issues_version_idx on public.issues (id, version);
```

### 2. version 자동 증가 트리거

```sql
-- version 증가 함수
create or replace function public.increment_version()
returns trigger
language plpgsql
as $$
begin
  new.version = old.version + 1;
  return new;
end;
$$;

-- 업데이트 시 version 자동 증가
create trigger increment_issue_version
  before update on public.issues
  for each row
  execute function public.increment_version();
```

### 3. 낙관적 잠금 함수

```sql
-- version 체크 후 업데이트 함수
create or replace function public.update_issue_with_version_check(
  p_issue_id uuid,
  p_version integer,
  p_title text default null,
  p_status text default null,
  p_priority text default null,
  p_assignee_id uuid default null,
  p_description text default null,
  p_updated_by uuid
)
returns jsonb
language plpgsql
as $$
declare
  v_current_version integer;
  v_updated_issue public.issues;
begin
  -- 현재 버전 확인
  select version into v_current_version
  from public.issues
  where id = p_issue_id;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'Issue not found'
    );
  end if;

  -- 버전 불일치 시 충돌 에러
  if v_current_version != p_version then
    return jsonb_build_object(
      'success', false,
      'error', 'CONFLICT',
      'currentVersion', v_current_version,
      'requestedVersion', p_version
    );
  end if;

  -- 버전 일치 시 업데이트
  update public.issues
  set
    title = coalesce(p_title, title),
    status = coalesce(p_status, status),
    priority = coalesce(p_priority, priority),
    assignee_id = p_assignee_id,
    description = coalesce(p_description, description),
    updated_by = p_updated_by
  where id = p_issue_id and version = p_version
  returning * into v_updated_issue;

  return jsonb_build_object(
    'success', true,
    'issue', to_jsonb(v_updated_issue)
  );
end;
$$;
```

---

## TypeScript 타입 정의

### 1. Issue 타입에 version 추가

```typescript
// src/features/issues/types.ts

export interface Issue {
  id: string;
  projectId: string;
  issueNumber: number;
  identifier: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  description: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;  // ✅ 추가
}
```

### 2. UpdateIssueInput 타입

```typescript
// src/features/issues/contracts.ts

export interface UpdateIssueInput {
  issueId: string;
  version: number;  // ✅ 필수: 읽은 시점의 버전
  title?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  description?: string;
  updatedBy: string;
}
```

### 3. 충돌 에러 타입

```typescript
// src/features/issues/types.ts

export interface ConflictError {
  type: 'CONFLICT';
  currentVersion: number;
  requestedVersion: number;
  message: string;
}

export type UpdateIssueResult =
  | { success: true; issue: Issue }
  | { success: false; error: ConflictError };
```

---

## Repository 구현

### SupabaseIssuesRepository.updateIssue

```typescript
// src/features/issues/repositories/supabase-issues-repository.ts

export class SupabaseIssuesRepository implements IssuesRepository {
  // ... 기존 메서드들

  async updateIssue(input: UpdateIssueInput): Promise<UpdateIssueResult> {
    // Supabase RPC 함수 호출
    const { data, error } = await this.client.rpc('update_issue_with_version_check', {
      p_issue_id: input.issueId,
      p_version: input.version,
      p_title: input.title ?? null,
      p_status: input.status ?? null,
      p_priority: input.priority ?? null,
      p_assignee_id: input.assigneeId ?? null,
      p_description: input.description ?? null,
      p_updated_by: input.updatedBy,
    });

    if (error) {
      throw new Error(`Failed to update issue: ${error.message}`);
    }

    const result = data as unknown as UpdateIssueResult;

    // 충돌 에러 처리
    if (!result.success && result.error === 'CONFLICT') {
      return {
        success: false,
        error: {
          type: 'CONFLICT',
          currentVersion: result.currentVersion,
          requestedVersion: result.requestedVersion,
          message: '이 이슈가 다른 사용자에 의해 변경되었습니다.',
        },
      };
    }

    // 성공
    return {
      success: true,
      issue: mapIssue(result.issue as TableRow<"issues">),
    };
  }
}
```

---

## Server Action 구현

### updateIssueAction

```typescript
// src/features/issues/actions/update-issue-action.ts

import { revalidatePath } from 'next/cache';
import type { UpdateIssueInput } from '../contracts';
import { SupabaseIssuesRepository } from '../repositories/supabase-issues-repository';

export async function updateIssueAction(input: UpdateIssueInput) {
  const repository = new SupabaseIssuesRepository();
  const result = await repository.updateIssue(input);

  if (!result.success) {
    // 충돌 에러 반환
    return {
      success: false,
      error: result.error,
    };
  }

  // 성공 시 캐시 무효화
  revalidatePath(`/projects/${input.projectId}/issues/${input.issueId}`);

  return {
    success: true,
    issue: result.issue,
  };
}
```

---

## UI 구현

### 1. 이슈 상세 페이지에서 버전 관리

```typescript
// src/app/projects/[projectId]/issues/[issueId]/page.tsx

export default async function IssueDetailPage({
  params,
}: {
  params: { projectId: string; issueId: string };
}) {
  const repository = new SupabaseIssuesRepository();
  const issue = await repository.getIssueById(params.issueId);

  if (!issue) {
    notFound();
  }

  // 버전을 클라이언트 컴포넌트에 전달
  return <IssueDetailClient issue={issue} />;
}
```

### 2. 클라이언트 컴포넌트에서 버전 추적

```typescript
// src/features/issues/components/issue-detail-client.tsx

'use client';

import { useState } from 'react';
import type { Issue } from '../types';
import { updateIssueAction } from '../actions/update-issue-action';

export function IssueDetailClient({ initialIssue }: { initialIssue: Issue }) {
  const [issue, setIssue] = useState(initialIssue);
  const [isEditing, setIsEditing] = useState(false);
  const [conflict, setConflict] = useState<ConflictError | null>(null);

  const handleTitleChange = async (newTitle: string) => {
    const result = await updateIssueAction({
      issueId: issue.id,
      version: issue.version,  // ✅ 현재 버전 전송
      title: newTitle,
      updatedBy: 'current-user-id',
    });

    if (result.success) {
      setIssue(result.issue);
      setIsEditing(false);
      setConflict(null);
    } else {
      // 충돌 발생
      setConflict(result.error);
    }
  };

  const handleReload = async () => {
    // 최신 버전 다시 로드
    const response = await fetch(`/api/issues/${issue.id}`);
    const latestIssue = await response.json();

    setIssue(latestIssue);
    setConflict(null);
    setIsEditing(false);
  };

  return (
    <div>
      {conflict ? (
        <ConflictDialog
          conflict={conflict}
          onReload={handleReload}
          onContinue={() => setConflict(null)}
        />
      ) : (
        <IssueEditor
          issue={issue}
          isEditing={isEditing}
          onEdit={setIsEditing}
          onSave={handleTitleChange}
        />
      )}
    </div>
  );
}
```

### 3. 충돌 다이얼로그 컴포넌트

```typescript
// src/features/issues/components/conflict-dialog.tsx

export function ConflictDialog({
  conflict,
  onReload,
  onContinue,
}: {
  conflict: ConflictError;
  onReload: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ⚠️ 변경 사항이 있습니다
        </h2>

        <p className="text-gray-600 mb-4">
          이 이슈가 다른 사용자에 의해 변경되었습니다.
          변경 내용을 확인 후 다시 시도해주세요.
        </p>

        <div className="bg-gray-50 rounded p-4 mb-4">
          <p className="text-sm text-gray-500">
            현재 버전: {conflict.currentVersion}<br />
            요청한 버전: {conflict.requestedVersion}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onReload}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            최신 버전 다시 로드
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            계속 편집하기
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 테스트

### 1. 단위 테스트

```typescript
// src/features/issues/repositories/supabase-issues-repository.test.ts

describe('updateIssue - optimistic locking', () => {
  it('should update issue when version matches', async () => {
    const repository = new SupabaseIssuesRepository();

    const result = await repository.updateIssue({
      issueId: 'issue-123',
      version: 5,  // 현재 버전
      title: '새 제목',
      updatedBy: 'user-123',
    });

    expect(result.success).toBe(true);
    expect(result.issue?.version).toBe(6);  // 버전 증가
  });

  it('should return conflict error when version mismatches', async () => {
    const repository = new SupabaseIssuesRepository();

    const result = await repository.updateIssue({
      issueId: 'issue-123',
      version: 3,  // 구 버전 (현재는 5)
      title: '새 제목',
      updatedBy: 'user-123',
    });

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('CONFLICT');
    expect(result.error?.currentVersion).toBe(5);
    expect(result.error?.requestedVersion).toBe(3);
  });
});
```

### 2. 통합 테스트

```typescript
// src/features/issues/actions/update-issue-action.test.ts

describe('updateIssueAction - concurrent edits', () => {
  it('should handle conflict when two users edit simultaneously', async () => {
    const repository = new SupabaseIssuesRepository();

    // Alice가 이슈 조회 (version: 5)
    const aliceIssue = await repository.getIssueById('issue-123');
    expect(aliceIssue?.version).toBe(5);

    // Bob도 같은 이슈 조회 (version: 5)
    const bobIssue = await repository.getIssueById('issue-123');
    expect(bobIssue?.version).toBe(5);

    // Alice가 먼저 저장
    const aliceResult = await repository.updateIssue({
      issueId: 'issue-123',
      version: 5,
      title: 'Alice의 수정',
      updatedBy: 'alice',
    });
    expect(aliceResult.success).toBe(true);
    expect(aliceResult.issue?.version).toBe(6);

    // Bob이 나중에 저장 (충돌)
    const bobResult = await repository.updateIssue({
      issueId: 'issue-123',
      version: 5,  // 여전히 version: 5
      title: 'Bob의 수정',
      updatedBy: 'bob',
    });
    expect(bobResult.success).toBe(false);
    expect(bobResult.error?.type).toBe('CONFLICT');
  });
});
```

---

## 마이그레이션 적용 방법

### 1. 마이그레이션 파일 생성

```bash
# 새 마이그레이션 파일 생성
touch supabase/migrations/0003_add_version_for_optimistic_locking.sql
```

### 2. 로컬 Supabase에 적용

```bash
# Supabase CLI로 로컬에 적용
supabase migration up

# 또는 원격 Supabase에 직접 적용
supabase db push
```

### 3. 타입스크립트 타입 업데이트

```bash
# Supabase 타입 생성
supabase gen types typescript --local > src/lib/supabase/types.ts
```

---

## 구현 체크리스트

### 데이터베이스
- [ ] `issues` 테이블에 `version` 컬럼 추가
- [ ] `version` 컬럼 인덱스 생성
- [ ] `increment_version` 함수 생성
- [ ] `increment_issue_version` 트리거 생성
- [ ] `update_issue_with_version_check` 함수 생성
- [ ] 함수 실행 권한 부여

### TypeScript
- [ ] `Issue` 타입에 `version` 필드 추가
- [ ] `UpdateIssueInput` 타입 정의
- [ ] `ConflictError` 타입 정의
- [ ] `UpdateIssueResult` 타입 정의
- [ ] `IssuesRepository` 인터페이스에 `updateIssue` 메서드 추가

### Repository
- [ ] `SupabaseIssuesRepository.updateIssue` 구현
- [ ] 충돌 에러 처리 로직 추가
- [ ] 버전 매핑 로직 추가

### Server Action
- [ ] `updateIssueAction` 구현
- [ ] 충돌 시 적절한 에러 반환
- [ ] 성공 시 캐시 무효화

### UI
- [ ] 이슈 상세 페이지에서 버전 추적
- [ ] 충돌 다이얼로그 컴포넌트 구현
- [ ] 최신 버전 재로드 기능
- [ ] 편집 중 버전 저장 로직

### 테스트
- [ ] 단위 테스트: 버전 일치 시 업데이트 성공
- [ ] 단위 테스트: 버전 불일치 시 충돌 에러
- [ ] 통합 테스트: 동시 편집 시나리오
- [ ] E2E 테스트: 충돌 해결 흐름

---

## 성능 고려사항

### 1. 인덱스 최적화
```sql
-- version 컬럼 인덱스로 쿼리 성능 향상
create index issues_version_idx on public.issues (id, version);
```

### 2. 캐시 전략
- 읽기: Next.js 캐시 활용 (`revalidatePath`)
- 쓰기: 즉시 반영 (`revalidatePath` 호출)

### 3. 동시성 제한
- 너무 많은 동시 요청 방지를 위한 rate limiting 고려
- 충돌 빈도가 높으면 잠금 방식 고려

---

## 다음 단계

낙관적 잠금 구현 후:

1. **필드 단위 잠금** 고려
   - 제목/설명/상태를 독립적으로 잠금
   - 충돌 빈도 감소

2. **자동 저장** 기능 추가
   - 주기적으로 자동 저장
   - 충돌 시 자동 병합 시도

3. **CRDT (Yjs)** 도입
   - 더 나은 동시 편집 경험
   - 오프라인 지원

---

## 관련 문서

- [Roadmap](/Users/choiho/zerone/hinear/docs/issue-detail/roadmap.md)
- [TDD Plan](/Users/choiho/zerone/hinear/docs/issue-detail/tdd-plan.md)
- [Implementation Plan](/Users/choiho/zerone/hinear/docs/issue-detail/implementation-plan.md)
