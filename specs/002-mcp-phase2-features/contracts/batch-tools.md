# Batch Tools Contract

**Feature**: MCP Phase 2/3 - Batch Operations
**Interface Type**: MCP Tools (stdio)
**Date**: 2026-03-26

## Overview

이 문서는 배치 업데이트 MCP tool의 인터페이스 계약을 정의합니다.

---

## Tool

### batch_update_issues

여러 이슈의 상태, 우선순위, 담당자를 한 번에 변경합니다.

**Input Schema**:
```typescript
{
  type: "object",
  properties: {
      type: "array",
      items: type: "string" ,
      minItems: 1,
      maxItems: 100,
      description: "이슈 ID 배열 (최대 100개)",
    updates: 
      type: "object",
      properties: 
          type: "string",
          enum: ["Triage", "Backlog", "Todo", "In Progress", "Done", "Canceled"],
          description: "새 상태 (선택)"
        },
        priority: 
          type: "string",
          enum: ["Urgent", "High", "Medium", "Low", "No priority"],
          description: "새 우선순위 (선택)"
        },
        assignee_id: 
          type: "string",
          description: "새 담당자 ID (선택, null로 담당자 제거)",
      minProperties: 1,
      description: "적어도 하나의 필드는 필요",
    comment_on_change: 
      type: "string",
      description: "변경 시 모든 이슈에 추가할 코멘트 (선택)",
  required: ["issue_ids", "updates"]
```

**Output Format**:
```typescript
  results: Array<
    issue_id: string;
    success: boolean;
    error?: string;>;
    total: number;
    succeeded: number;
    failed: number;;
  duration_ms: number;
```

**Error Responses**:
- `TOO_MANY_ISSUES`: 이슈 수가 100개 초과
- `NO_UPDATES`: 변경할 필드가 없음
- `INVALID_STATUS`: 잘못된 상태 값
- `INVALID_PRIORITY`: 잘못된 우선순위 값
- `ASSIGNEE_NOT_MEMBER`: 담당자가 프로젝트 멤버가 아님

**Example (성공)**:
```json
  "results": [
      "issue_id": "550e8400-e29b-41d4-a716-446655440000",
      "success": true,
      "issue_id": "550e8400-e29b-41d4-a716-446655440001",
      "success": true,
      "issue_id": "550e8400-e29b-41d4-a716-446655440002",
      "success": false,
      "error": "Issue not found"
  ],
  "summary": 
    "total": 3,
    "succeeded": 2,
    "failed": 1,
  "duration_ms": 1523
```

**Example (실패 - 너무 많은 이슈)**:
```json
  "error": "TOO_MANY_ISSUES",
  "message": "Maximum 100 issues per batch. Got: 150"
```

---

## Implementation Notes

### Validation Rules

1. **Issue Count Limit**:
   - 최대 100개 이슈
   - 초과 시: `TOO_MANY_ISSUES`

2. **At Least One Update**:
   - `status`, `priority`, `assignee_id` 중 최소 하나 필요
   - 없으면: `NO_UPDATES`

3. **Assignee Validation**:
   - `assignee_id`가 있으면 프로젝트 멤버십 검사
   - 실패 시 해당 이슈만 실패 처리

4. **Status/Priority Values**:
   - 정의된 enum 값만 허용
   - 에러: `INVALID_STATUS`, `INVALID_PRIORITY`

### Execution Strategy

1. **Parallel Processing**:
   ```typescript
   const chunks = chunk(issueIds, 10); // 10개씩 묶음
   for (const chunk of chunks) {
     await Promise.allSettled(
       chunk.map(id => updateSingleIssue(id, updates, commentOnChange))
     );
   }
   ```

2. **Individual Transactions**:
   - 각 이슈 업데이트는 독립 트랜잭션
   - 하나의 실패가 전체를 롤백하지 않음
   - 부분 성공 허용

3. **Activity Logging**:
   - 성공한 이슈마다 활동 로그 기록
   - `issue.status.updated`, `issue.priority.updated`, `issue.assignee.updated`

4. **Optional Comment**:
   - `comment_on_change`가 있으면 성공한 모든 이슈에 코멘트 추가
   - 코멘트 추가 실패는 이슈 업데이트 실패로 간주하지 않음

### Performance Considerations

- **Target**: 100개 이슈 30초 이내
- **Parallelism**: 10개 동시 요청
- **Estimated Time**: 10-20초 (100개 기준)

### Error Handling

| Scenario | Behavior |
|----------|----------|
| Issue not found | 개별 실패, error 메시지 |
| Access denied | 개별 실패, error 메시지 |
| Assignee not member | 개별 실패, error 메시지 |
| Database error | 개별 실패, error 메시지 |
| Comment fails | 이슈는 성공, 코멘트만 실패 |

---

## Testing Checklist

- [ ] 101개 이슈 → TOO_MANY_ISSUES
- [ ] 빈 updates → NO_UPDATES
- [ ] 잘못된 status → INVALID_STATUS
- [ ] 담당자가 멤버 아님 → 일부 실패
- [ ] 100개 이슈 배치 업데이트 → 30초 이내 완료
- [ ] comment_on_change → 모든 성공한 이슈에 코멘트 추가
- [ ] 일부 이슈만 성공 → summary 정확함
- [ ] assignee_id: null → 담당자 제거됨
