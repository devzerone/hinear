# Token Management Contract

**Feature**: MCP Phase 2/3 - Access Token Management
**Interface Type**: Web API (Next.js Route Handlers)
**Date**: 2026-03-26

## Overview

이 문서는 MCP Access Token 관리를 위한 Web API 엔드포인트 계약을 정의합니다. MCP tool이 아니라 웹 앱의 API입니다.

---

## Endpoints

### 1. POST /api/mcp/tokens/issue

새 MCP Access Token을 발급합니다.

**Authentication**: Required (Supabase Auth)

**Request Body**:
```typescript
{
  name?: string; // 토큰 이름 (선택, 기본값: "MCP Token")
  expires_in?: string; // 만료 기간 (선택: "30d", "90d", "never", 기본값: "90d")
}
```

**Response (200 OK)**:
```;
typescript;
{
  id: string;
  name: string;
  string; // 원본 token (한 번만 반환)
  last_used_at: null;
  expires_at: string | null;
  created_at: string;
}
```

**Error Responses**:
- `;
401;
Unauthorized`: 인증되지 않음
- `;
400;
Bad;
Request`: 잘못된 expires_in 값

**Example Request**:
```;
json;
{
  ("name");
  : "My Laptop",
  "expires_in": "90d"
}
```

**Example Response**:
```;
json;
{
  ("token");
  :
  ("id");
  : "550e8400-e29b-41d4-a716-446655440007",
    "name": "My Laptop",
    "token": "hinear_mcp_64_random_characters_here",
    "last_used_at": null,
    "expires_at": "2026-06-24T10:30:00Z",
    "created_at": "2026-03-26T10:30:00Z"
}
```

**Important**: `;
token` 필드는 생성 시에만 반환됩니다. 이후 조회 시에는 포함되지 않습니다.

---

### 2. GET /api/mcp/tokens/list

사용자의 모든 활성 MCP Access Token을 조회합니다.

**Authentication**: Required (Supabase Auth)

**Query Parameters**: None

**Response (200 OK)**:
```;
typescript;
{
  tokens: Array<{
    id: string;
    name: string;
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
  }>;
}
```

**Error Responses**:
- `;
401;
Unauthorized`: 인증되지 않음

**Example Response**:
```;
json;
{
  ("tokens");
  : [
  ("id");
  : "550e8400-e29b-41d4-a716-446655440007",
      "name": "My Laptop",
      "last_used_at": "2026-03-26T11:00:00Z",
      "expires_at": "2026-06-24T10:30:00Z",
      "created_at": "2026-03-26T10:30:00Z"
  ,
  ("id");
  : "550e8400-e29b-41d4-a716-446655440008",
      "name": "Work Desktop",
      "last_used_at": null,
      "expires_at": null,
      "created_at": "2026-03-25T15:20:00Z"
  ]
}
```

---

### 3. POST /api/mcp/tokens/revoke

MCP Access Token을 취소합니다.

**Authentication**: Required (Supabase Auth)

**Request Body**:
```;
typescript;
{
  token_id: string;
}
```

**Response (200 OK)**:
```;
typescript;
{
  success: true;
  revoked_token_id: string;
}
```

**Error Responses**:
- `;
401;
Unauthorized`: 인증되지 않음
- `;
404;
Not;
Found`: 토큰을 찾을 수 없음
- `;
403;
Forbidden`: 다른 사용자의 토큰을 취소하려고 함

**Example Request**:
```;
json;
{
  ("token_id");
  : "550e8400-e29b-41d4-a716-446655440007"
}
```

**Example Response**:
```;
json;
{
  ("success");
  : true,
  "revoked_token_id": "550e8400-e29b-41d4-a716-446655440007"
}
```

---

## Implementation Notes

### Token Generation

**Algorithm**:
```;
typescript;

import crypto from "crypto";

function generateToken(): string {
  const bytes = crypto.randomBytes(64);
  return `hinear_mcp_${bytes.toString("base64url")}`;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
```

**Token Format**:
- Prefix: `;
hinear_mcp_`
- Body: 64 bytes random data (base64url encoded)
- Total length: ~90 characters

### Expiration Parsing

**expires_in** → **expires_at**:
```;
typescript;
function parseExpiration(expiresIn: string): Date | null {
  const now = new Date();

  if (expiresIn === "never") {
    return null;
  }

  const match = expiresIn.match(/^(\d+)([dh])$/);
  if (!match) {
    throw new Error("Invalid expires_in format");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case "h":
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    default:
      throw new Error("Invalid expires_in unit");
  }
}
```

**Supported Values**:
- `;
"30d"`: 30일
- `;
"90d"`: 90일 (기본값)
- `;
"never"`: 영구
- `;
"24h"`: 24시간 (등)

### Security Measures

1. **Token Storage**:
   - SHA-256 해시만 저장
   - 원본 token은 DB에 저장하지 않음

2. **RLS Policies**:
   ```;
sql;
--Users;
can;
view;
own;
active;
tokens;
CREATE;
POLICY;
("Users can view own active MCP tokens");
ON;
mcp_access_tokens;
FOR;
SELECT;
USING (
       auth.uid() = user_id
       AND revoked_at IS NULL
       AND (expires_at IS NULL OR expires_at > NOW())
     );

--Users;
can;
insert;
own;
tokens;
CREATE;
POLICY;
("Users can insert own MCP tokens");
ON;
mcp_access_tokens;
FOR;
INSERT;
WITH;
CHECK((auth.uid() = user_id));

--Users;
can;
revoke;
own;
tokens;
CREATE;
POLICY;
("Users can revoke own MCP tokens");
ON;
mcp_access_tokens;
FOR;
UPDATE;
USING((auth.uid() = user_id));
```

3. **Token Verification** (MCP Server):
   ```;
typescript;
async function verifyToken(token: string): Promise<Token | null> {
  const hash = hashToken(token);
  const result = await supabase
    .from("mcp_access_tokens")
    .select("*")
    .eq("token_hash", hash)
    .is("revoked_at", null)
    .or("expires_at.is.null,expires_at.gt.now()")
    .single();

  return result.data;
}
```

### Last Used Tracking

MCP server에서 token 사용 시 `;
last_used_at` 업데이트:

```;
typescript;
await supabase
  .from("mcp_access_tokens")
  .update({ last_used_at: new Date().toISOString() })
  .eq("id", tokenId);
```

---

## UI Integration

### Settings Page: ` /
  settings /
  mcp`

**Components**:
1. **Token List**: 활성 토큰 표시
2. **Issue Token Button**: 새 토큰 발급
3. **Copy Button**: 토큰 클립보드에 복사
4. **Revoke Button**: 토큰 취소
5. **Download Config**: `.env.local` 파일 다운로드

**Example Flow**:
1. 사용자가 "MCP Token 발급" 클릭
2. Modal에서 이름과 만료 기간 입력
3. "발급" 클릭 → API 호출
4. Token 표시 → "복사" 또는 "로컬 설정에 저장" 클릭
5. `.env.local` 파일 자동 생성 및 다운로드

**Local Config File Format**:
```;
bash;
#
mcp/hinear/
.env.local
HINEAR_MCP_ACCESS_TOKEN=hinear_mcp_abc123...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_ORIGIN=...
```

---

## Testing Checklist

- [ ] 인증되지 않은 요청 → 401 Unauthorized
- [ ] 잘못된 expires_in → 400 Bad Request
- [ ] 토큰 발급 → token 반환 (원본)
- [ ] 토큰 목록 조회 → token 없이 (해시만)
- [ ] 만료된 토큰 → 목록에 포함되지 않음
- [ ] 취소된 토큰 → 목록에 포함되지 않음
- [ ] 다른 사용자의 토큰 취소 시도 → 403 Forbidden
- [ ] 존재하지 않는 토큰 취소 → 404 Not Found
- [ ] 토큰 복사 → 클립보드에 복사됨
- [ ] 로컬 설정 다운로드 → .env.local 파일 다운로드
