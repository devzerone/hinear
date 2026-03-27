# Member Tools Contract

**Feature**: MCP Phase 2/3 - Member Management
**Interface Type**: MCP Tools (stdio)
**Date**: 2026-03-26

## Overview

이 문서는 멤버 관리 MCP tools의 인터페이스 계약을 정의합니다.

---

## Tools

### 1. list_members

프로젝트의 모든 멤버를 조회합니다.

**Input Schema**:
```typescript
{
  type: "object", properties;
  :
  type: "string", description;
  : "프로젝트 ID"
  ,
  required: ["project_id"]
}
```

**Output Format**:
```;
typescript;
{
  members: Array<{
    id: string;
    role: "owner" | "member";
    profile: {
      id: string;
      display_name?: string;
      email?: string;
    };
    created_at: string; // ISO 8601
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
  ("members");
  : [
  ("id")
  : "550e8400-e29b-41d4-a716-446655440000",
      "role": "owner",
      "profile":
  ("id")
  : "550e8400-e29b-41d4-a716-446655440001",
        "display_name": "John Doe",
        "email": "john@example.com"
  ,
      "created_at": "2026-03-26T10:00:00Z"
  ,
  ("id")
  : "550e8400-e29b-41d4-a716-446655440002",
      "role": "member",
      "profile":
  ("id")
  : "550e8400-e29b-41d4-a716-446655440003",
        "display_name": "Jane Smith",
        "email": "jane@example.com"
  ,
      "created_at": "2026-03-26T10:05:00Z"
  ],
  "total": 2
}
```

---

### 2. invite_member

새 멤버를 초대합니다.

**Input Schema**:
```;
typescript;
{
  type: "object",
  properties: 
      type: "string",
      description: "프로젝트 ID",
    email: 
      type: "string",
      format: "email",
      description: "초대받을 이메일",
    role: 
      type: "string",
      enum: ["owner", "member"],
      description: "역할"
    },
  required: ["project_id", "email", "role"]
```

**Output Format**:
```typescript
    id: string;
    email: string;
    role: "owner" | "member";
    status: "pending";
    expires_at: string; // ISO 8601
    created_at: string; // ISO 8601;
  invite_url: string; // 초대 링크 (웹 앱 URL)
```

**Error Responses**:
- `PROJECT_NOT_FOUND`: 프로젝트를 찾을 수 없음
- `ACCESS_DENIED`: 소유자만 초대 가능
- `ALREADY_MEMBER`: 이미 멤버임
- `INVITATION_EXISTS`: 대기 중인 초대가 이미 있음
- `CANNOT_INVITE_SELF`: 자신을 초대할 수 없음
- `INVALID_EMAIL`: 잘못된 이메일 형식

**Example**:
```json
  "invitation": 
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "email": "newuser@example.com",
    "role": "member",
    "status": "pending",
    "expires_at": "2026-04-02T10:00:00Z",
    "created_at": "2026-03-26T10:10:00Z",
  "invite_url": "https://hinear.app/invitations/abc123token"
```

---

### 3. update_member_role

멤버의 역할을 변경합니다.

**Input Schema**:
```typescript
  type: "object",
  properties: 
      type: "string",
      description: "프로젝트 멤버 ID",
    role: 
      type: "string",
      enum: ["owner", "member"],
      description: "새 역할"
    },
  required: ["member_id", "role"]
```

**Output Format**:
```typescript
    id: string;
    role: "owner" | "member";
      id: string;
      display_name?: string;
      email?: string;;
    created_at: string;
    updated_at: string;
```

**Error Responses**:
- `MEMBER_NOT_FOUND`: 멤버를 찾을 수 없음
- `ACCESS_DENIED`: 소유자만 역할 변경 가능
- `LAST_OWNER`: 마지막 소유자는 member로 변경 불가
- `SAME_ROLE`: 이미 같은 역할임

**Example**:
```json
  "member": 
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "role": "owner",
    "profile": 
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "display_name": "Jane Smith",
      "email": "jane@example.com",
    "created_at": "2026-03-26T10:05:00Z",
    "updated_at": "2026-03-26T10:15:00Z"
```

---

### 4. remove_member

멤버를 제거합니다. 대기 중인 초대도 취소할 수 있습니다.

**Input Schema**:
```typescript
  type: "object",
  properties: 
      type: "string",
      description: "프로젝트 멤버 ID (또는 초대 ID)",
  required: ["member_id"]
```

**Output Format**:
```typescript
  success: true;
  removed_member_id: string;
  type: "member" | "invitation";
```

**Error Responses**:
- `MEMBER_NOT_FOUND`: 멤버/초대를 찾을 수 없음
- `ACCESS_DENIED`: 소유자만 제거 가능
- `LAST_OWNER`: 마지막 소유자는 제거 불가
- `CANNOT_REMOVE_SELF`: 자신을 제거할 수 없음

**Example (멤버 제거)**:
```json
  "success": true,
  "removed_member_id": "550e8400-e29b-41d4-a716-446655440002",
  "type": "member"
```

**Example (초대 취소)**:
```json
  "success": true,
  "removed_member_id": "550e8400-e29b-41d4-a716-446655440004",
  "type": "invitation"
```

---

## Implementation Notes

### Validation Rules

1. **Owner-Only Operations**:
   - `invite_member`, `update_member_role`, `remove_member`
   - 소유자(owner)만 실행 가능
   - 에러: `ACCESS_DENIED`

2. **Last Owner Protection**:
   - 마지막 소유자는 제거 불가
   - 마지막 소유자는 member로 변경 불가
   - 에러: `LAST_OWNER`

3. **Self-Operations**:
   - 자신을 초대할 수 없음: `CANNOT_INVITE_SELF`
   - 자신을 제거할 수 없음: `CANNOT_REMOVE_SELF`

4. **Duplicate Invitation**:
   - 같은 이메일로 pending 초대가 있으면 중복 생성 불가
   - 에러: `INVITATION_EXISTS`

5. **Already Member**:
   - 이미 멤버인 이메일로 초대 불가
   - 에러: `ALREADY_MEMBER`

### Invitation Flow

1. **Create Invitation**:
   ```sql
   INSERT INTO invitations (project_id, email, role, token)
   VALUES ($1, $2, $3, $4)
   ```

2. **Send Email** (웹 앱):
   - 초대 이메일 전송
   - `invite_url` 포함

3. **Accept Invitation** (웹 앱):
   - 사용자가 링크 클릭
   - `project_members`에 row 추가
   - `invitations.status` → 'accepted'

### Member vs Invitation

`remove_member`는 두 경우 모두 처리:

1. **Active Member**:
   - `project_members`에서 삭제
   - `type: "member"`

2. **Pending Invitation**:
   - `invitations.status` → 'revoked'
   - `type: "invitation"`

### Email Privacy

- `profile.email`은 멤버만 볼 수 있음
- 비멤버에게는 이메일 숨김
- MCP tool은 인증된 사용자이므로 이메일 노출

---

## Testing Checklist

- [ ] 소유자가 아닌 사용자가 초대 시도 → ACCESS_DENIED
- [ ] 마지막 소유자를 member로 변경 → LAST_OWNER
- [ ] 마지막 소유자 제거 → LAST_OWNER
- [ ] 자신을 초대 → CANNOT_INVITE_SELF
- [ ] 자신을 제거 → CANNOT_REMOVE_SELF
- [ ] 이미 멤버인 이메일로 초대 → ALREADY_MEMBER
- [ ] pending 초대가 있는 이메일로 재초대 → INVITATION_EXISTS
- [ ] 대기 중인 초대 취소 → type: "invitation"
