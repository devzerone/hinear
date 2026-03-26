# Label Tools Contract

**Feature**: MCP Phase 2/3 - Label Management
**Interface Type**: MCP Tools (stdio)
**Date**: 2026-03-26

## Overview

이 문서는 라벨 관리 MCP tools의 인터페이스 계약을 정의합니다.

---

## Tools

### 1. list_labels

프로젝트의 모든 라벨을 조회합니다.

**Input Schema**:
```typescript
{
  type: "object", properties;
  :
  type: "string", description;
  : "프로젝트 ID"
  ,
    limit:
  type: "number", description;
  : "최대 결과 수 (기본값: 50, 최대: 100)"
  ,
  required: ["project_id"]
}
```

**Output Format**:
```;
typescript;
{
  labels: Array<{
    id: string;
    name: string;
    color: string; // #RRGGBB
    description?: string;
    issue_count: number;
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601
  }>;
  total: number;
}
```

**Error Responses**:
- `;
PROJECT_NOT_FOUND`: 프로젝트를 찾을 수 없음
- `;
ACCESS_DENIED`: 프로젝트 접근 권한 없음

**Example**:
```;
json;
{
  ("labels");
  : [
  ("id")
  : "550e8400-e29b-41d4-a716-446655440000",
      "name": "Bug",
      "color": "#ff0000",
      "description": "버그 리포트",
      "issue_count": 12,
      "created_at": "2026-03-26T10:00:00Z",
      "updated_at": "2026-03-26T10:00:00Z"
  ],
  "total": 1
}
```

---

### 2. create_label

새 라벨을 생성합니다.

**Input Schema**:
```;
typescript;
{
  type: "object", properties;
  :
  type: "string", description;
  : "프로젝트 ID"
  ,
    name:
  type: "string", description;
  : "라벨 이름 (프로젝트 내에서 대소문자 구분 없이 유일)"
  ,
    color:
  type: "string", description;
  : "색상 코드 (#RRGGBB 형식)"
      pattern: "^#[0-9A-Fa-f]{6}$"
  ,
    description:
  type: "string", description;
  : "라벨 설명 (선택)"
  ,
  required: ["project_id", "name", "color"]
}
```

**Output Format**:
```;
typescript;
{
  id: string;
  name: string;
  color: string;
  description?: string;
  issue_count: 0;
  created_at: string;
  updated_at: string;
}
```

**Error Responses**:
- `;
PROJECT_NOT_FOUND`: 프로젝트를 찾을 수 없음
- `;
ACCESS_DENIED`: 프로젝트 멤버만 라벨 생성 가능
- `;
LABEL_ALREADY_EXISTS`: 같은 이름의 라벨이 이미 존재
- `;
INVALID_COLOR`: 색상 코드 형식 오류

**Example**:
```;
json;
{
  ("label");
  :
  ("id")
  : "550e8400-e29b-41d4-a716-446655440001",
    "name": "Feature",
    "color": "#00ff00",
    "description": "새로운 기능",
    "issue_count": 0,
    "created_at": "2026-03-26T10:05:00Z",
    "updated_at": "2026-03-26T10:05:00Z"
}
```

---

### 3. update_label

라벨 정보를 수정합니다.

**Input Schema**:
```;
typescript;
{
  type: "object", properties;
  :
  type: "string", description;
  : "라벨 ID"
  ,
    name:
  type: "string", description;
  : "새 라벨 이름 (선택)"
  ,
    color:
  type: "string", description;
  : "새 색상 코드 (#RRGGBB, 선택)"
      pattern: "^#[0-9A-Fa-f]{6}$"
  ,
    description:
  type: "string", description;
  : "새 설명 (선택, null로 삭제 가능)"
  ,
  required: ["label_id"]
}
```

**Output Format**:
```;
typescript;
{
  id: string;
  name: string;
  color: string;
  description?: string;
  issue_count: number;
  created_at: string;
  updated_at: string;
}
```

**Error Responses**:
- `;
LABEL_NOT_FOUND`: 라벨을 찾을 수 없음
- `;
ACCESS_DENIED`: 프로젝트 멤버만 수정 가능
- `;
LABEL_ALREADY_EXISTS`: 같은 이름의 라벨이 이미 존재 (name 변경 시)
- `;
INVALID_COLOR`: 색상 코드 형식 오류

**Example**:
```;
json;
{
  ("label");
  :
  ("id")
  : "550e8400-e29b-41d4-a716-446655440001",
    "name": "Enhancement",
    "color": "#0000ff",
    "description": "기능 개선",
    "issue_count": 5,
    "created_at": "2026-03-26T10:05:00Z",
    "updated_at": "2026-03-26T10:10:00Z"
}
```

---

### 4. delete_label

라벨을 삭제합니다. 연결된 이슈에서도 라벨이 제거됩니다.

**Input Schema**:
```;
typescript;
{
  type: "object", properties;
  :
  type: "string", description;
  : "삭제할 라벨 ID"
  ,
  required: ["label_id"]
}
```

**Output Format**:
```;
typescript;
{
  success: true;
  deleted_label_id: string;
  affected_issues_count: number; // 라벨이 제거된 이슈 수
}
```

**Error Responses**:
- `;
LABEL_NOT_FOUND`: 라벨을 찾을 수 없음
- `;
ACCESS_DENIED`: 프로젝트 멤버만 삭제 가능

**Example**:
```;
json;
{
  ("success");
  : true,
  "deleted_label_id": "550e8400-e29b-41d4-a716-446655440001",
  "affected_issues_count": 5
}
```

---

## Implementation Notes

### Validation Rules

1. **Name Uniqueness**:
   - 프로젝트 내에서 대소문자 구분 없이 유일
   - `;
CREATE`와 `;
UPDATE`에서 검증
   - 에러: `;
LABEL_ALREADY_EXISTS`

2. **Color Format**:
   - 정규식: ` ^ #;
[0-9A - Fa - f];
{
  6;
}
$`
   - 예: `;
#ff0000
`, `;
#
00FF00`, `#0000ff`
   - 에러: `INVALID_COLOR`

3. **Access Control**:
   - 프로젝트 멤버(member) 이상만 라벨 생성/수정/가능
   - 프로젝트 소유자(owner)만 라벨 삭제 가능
   - 에러: `ACCESS_DENIED`

### Cascade Behavior

- 라벨 삭제 시 `issue_labels` 테이블에서 자동으로 제거 (CASCADE)
- 연결된 이슈의 `updated_at`은 갱신되지 않음 (의도적)

### Performance Considerations

- `list_labels`는 기본적으로 50개 제한, 최대 100개
- `issue_count`는 실시간 계산 (캐시 없음)
- 대규모 라벨(1000+)인 경우 `issue_count` 계산에 시간 소요 가능

---

## Testing Checklist

- [ ] 중복 이름으로 라벨 생성 시도 → LABEL_ALREADY_EXISTS
- [ ] 잘못된 색상 코드 → INVALID_COLOR
- [ ] 존재하지 않는 라벨 수정 → LABEL_NOT_FOUND
- [ ] 라벨 삭제 후 연결된 이슈에서 라벨 제거됨
- [ ] 프로젝트 멤버가 아닌 사용자가 라벨 생성 → ACCESS_DENIED
- [ ] 대소문자만 다른 라벨 이름 → LABEL_ALREADY_EXISTS (case-insensitive)
