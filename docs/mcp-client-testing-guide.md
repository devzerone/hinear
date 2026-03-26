# MCP 클라이언트 테스트 가이드

**목적**: Hinear MCP 서버를 Claude Desktop 등의 MCP 클라이언트에서 사용하는 방법
**날짜**: 2026-03-26
**버전**: MCP Server v0.2.0

---

## 개요

Hinear MCP 서버는 stdio를 통해 통신하는 로컬 MCP 서버입니다. Claude Desktop, Cline, Continue 등 MCP를 지원하는 AI 코드 에디터에서 사용할 수 있습니다.

---

## 1. 사전 준비

### 1.1 필수 환경 변수

다음 환경 변수가 설정되어 있어야 합니다:

```bash
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MCP 인증 (둘 중 하나 필수)
HINEAR_MCP_ACCESS_TOKEN=hinear_mcp_xxx  # 또는
HINEAR_MCP_USER_ID=your-user-uuid
```

### 1.2 GitHub 통합 (선택 사항)

GitHub 기능을 사용하려면:

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

---

## 2. 로그인 설정

### 2.1 자동 로그인 스크립트 사용

```bash
cd /home/choiho/zerone/hinear
pnpm mcp:hinear:login
```

이 스크립트는 다음을 수행합니다:
1. `.env.local` 파일의 기존 설정 로드
2. 필요한 환경 변수 입력 받기
3. `mcp/hinear/.env.local` 파일에 저장

### 2.2 이메일로 사용자 ID 자동 설정

```bash
pnpm mcp:hinear:login --email you@example.com
```

### 2.3 비대화형 설정

```bash
pnpm mcp:hinear:login --non-interactive
```

---

## 3. Claude Desktop 설정

### 3.1 MCP 서버 설정 확인

`.mcp.json` 파일이 이미 구성되어 있습니다:

```json
{
  "mcpServers": {
    "hinear": {
      "type": "stdio",
      "command": "pnpm",
      "args": ["--dir", "/home/choiho/zerone/hinear", "mcp:hinear"]
    }
  }
}
```

### 3.2 Claude Desktop 시작

1. **Claude Desktop 앱 실행**
2. **MCP 서버 자동 연결**: `.mcp.json` 설정을 읽어 자동으로 서버 시작
3. **연결 확인**: 좌측 하단의 MCP 상태 표시에서 "hinear" 확인

### 3.3 환경 변수 로드 확인

MCP 서버가 자동으로 `mcp/hinear/.env.local`을 로드합니다.

---

## 4. MCP 툴 테스트 시나리오

### 4.1 기본 상태 확인

**프롬프트**:
```
Hinear MCP 서버 상태를 확인해줘.
```

**예상 응답**:
- Server 버전: 0.2.0
- 구현된 툴: 19개
- 인증 상태: Active

### 4.2 프로젝트 목록 조회

**프롬프트**:
```
내가 접근할 수 있는 Hinear 프로젝트 목록을 보여줘.
```

**MCP Tool 호출**:
```typescript
list_projects({
  include_archived: false
})
```

**예상 응답**:
- 프로젝트 목록 (이름, 키, 역할)

### 4.3 이슈 검색

**프롬프트**:
```
WEB 프로젝트에서 "auth" 관련 이슈들을 검색해줘.
```

**MCP Tool 호출**:
```typescript
search_issues({
  project_id: "project-uuid",
  query: "auth"
})
```

### 4.4 라벨 관리 (Phase 2 신규)

**4.4.1 라벨 목록 조회**:
```
WEB 프로젝트의 모든 라벨을 보여줘.
```

**4.4.2 새 라벨 생성**:
```
WEB 프로젝트에 "Bug" 라벨을 빨간색(#FF0000)으로 만들어줘.
```

**4.4.3 라벨 수정**:
```
"Bug" 라벨의 색상을 주황색(#FF6600)으로 바꿔줘.
```

**4.4.4 라벨 삭제**:
```
테스트용 "Test" 라벨을 삭제해줘.
```

### 4.5 배치 업데이트 (Phase 2 신규)

**프롬프트**:
```
WEB-1, WEB-2, WEB-3 이슈들을 한 번에 "Done" 상태로 변경해줘. 코멘트는 "배치 완료"로 남겨줘.
```

**MCP Tool 호출**:
```typescript
batch_update_issues({
  issue_ids: ["uuid1", "uuid2", "uuid3"],
  updates: { status: "Done" },
  comment_on_change: "배치 완료"
})
```

**예상 응답**:
- 총 3개 중 3개 성공
- 개별 결과 보고

### 4.6 멤버 관리 (Phase 2 신규)

**4.6.1 멤버 목록**:
```
WEB 프로젝트의 모든 멤버를 보여줘.
```

**4.6.2 멤버 초대**:
```
newuser@example.com을 WEB 프로젝트에 member 역할로 초대해줘.
```

**4.6.3 역할 변경**:
```
jane@example.com의 역할을 owner로 변경해줘.
```

**4.6.4 멤버 제거**:
```
bob@example.com을 WEB 프로젝트에서 제거해줘.
```

### 4.7 GitHub 통합 (Phase 3 신규)

**4.7.1 브랜치 생성**:
```
WEB-123 이슈용으로 GitHub 브랜치를 만들어줘.
```

**예상 브랜치명**: `WEB-123-issue-title`

**4.7.2 GitHub 이슈 연결**:
```
WEB-456 이슈를 https://github.com/owner/repo/issues/789 와 연결해줘.
```

**4.7.3 GitHub PR 연결**:
```
WEB-789 이슈를 https://github.com/owner/repo/pull/123 와 연결하고 auto-merge를 설정해줘.
```

---

## 5. 복잡한 워크플로우 예시

### 5.1 이슈 생성부터 라벨링까지

```
1. WEB 프로젝트에 "사용자 인증 기능 구현" 이슈를 생성해줘.
2. 이슈의 우선순위를 "High"로 설정해줘.
3. "Feature" 라벨을 파란색(#0000FF)으로 만들어서 이슈에 붙여줘.
```

### 5.2 배치 작업과 GitHub 통합

```
1. WEB 프로젝트에서 "API" 관련 모든 이슈를 검색해줘.
2. 검색된 이슈들을 전부 "Backlog" 상태로 변경해줘.
3. WEB-101 이슈용 GitHub 브랜치를 생성해줘.
```

### 5.3 팀 멤버 초대와 역할 관리

```
1. WEB 프로젝트의 현재 멤버들을 보여줘.
2. dev@company.com을 초대해줘.
3. 초대된 멤버의 역할을 확인해줘.
```

---

## 6. 문제 해결

### 6.1 인증 실패

**증상**: "Authentication required" 에러

**해결**:
```bash
# 1. 로그인 재실행
pnpm mcp:hinear:login

# 2. 환경 변수 확인
cat mcp/hinear/.env.local

# 3. MCP 서버 재시작
# Claude Desktop에서 재연결
```

### 6.2 GitHub API 오류

**증상**: "GITHUB_TOKEN not found"

**해결**:
```bash
# 환경 변수 추가
export GITHUB_TOKEN=ghp_xxx

# 또는 .env.local에 추가
echo "GITHUB_TOKEN=ghp_xxx" >> mcp/hinear/.env.local
```

### 6.3 Rate Limiting

**증상**: GitHub API 403 Forbidden

**해결**:
- 1시간 후 다시 시도
- 또는 GitHub Personal Access Token의 권한 확인

### 6.4 데이터베이스 연결 실패

**증상**: "Failed to connect to Supabase"

**해결**:
```bash
# 1. Supabase URL 확인
echo $NEXT_PUBLIC_SUPABASE_URL

# 2. 네트워크 연결 확인
ping your-project.supabase.co

# 3. 서비스 롤키 유효성 확인
# Supabase Dashboard → Settings → API → service_role (secret)
```

---

## 7. Smoke Test (자동화된 테스트)

### 7.1 Read-only smoke test

```bash
pnpm mcp:hinear:smoke
```

- MCP 서버 시작
- 툴 등록 확인
- `hinear_mcp_status` 호출
- `list_projects` 호출 (인증된 경우)

### 7.2 Write smoke test

```bash
pnpm mcp:hinear:smoke --write
```

- Read test 포함
- `create_issue` 호출
- `get_issue_detail` 호출
- `update_issue_status` 호출
- `add_comment` 호출

---

## 8. CI/CD 통합

### 8.1 GitHub Actions 설정

필요한 Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HINEAR_MCP_EMAIL`

### 8.2 CI 동작

1. MCP Smoke job 실행
2. 모든 툴 등록 확인
3. 기본 기능 테스트
4. 실패 시 에러 메시지 출력 (시크릿 노출 없음)

---

## 9. 다음 단계

1. ✅ **기본 테스트**: Claude Desktop에서 간단한 명령어로 테스트
2. **복잡한 워크플로우**: 여러 툴을 조합하여 실제 작업 시뮬레이션
3. **에러 핸들링**: 다양한 에러 케이스 테스트
4. **피드백 수집**: 사용 경험 개선점 파악

---

## 10. MCP 툴 레퍼런스

### Phase 1 (MVP) - 7개 툴

| 툴 이름 | 설명 | 입력 |
|---------|------|------|
| `hinear_mcp_status` | 서버 상태 확인 | 없음 |
| `list_projects` | 프로젝트 목록 | `include_archived?` |
| `search_issues` | 이슈 검색 | `project_id`, `query?` |
| `get_issue_detail` | 이슈 상세 | `issue_id` |
| `create_issue` | 이슈 생성 | `project_id`, `title`, `status?`, `priority?` |
| `update_issue_status` | 상태 변경 | `issue_id`, `status` |
| `add_comment` | 코멘트 추가 | `issue_id`, `content` |

### Phase 2 - 11개 툴

| 툴 이름 | 설명 | 입력 |
|---------|------|------|
| **라벨 관리** |||
| `list_labels` | 라벨 목록 | `project_id` |
| `create_label` | 라벨 생성 | `project_id`, `name`, `color`, `description?` |
| `update_label` | 라벨 수정 | `label_id`, `name?`, `color?`, `description?` |
| `delete_label` | 라벨 삭제 | `label_id` |
| **배치 작업** |||
| `batch_update_issues` | 배치 업데이트 | `issue_ids[]`, `updates{}`, `comment_on_change?` |
| **멤버 관리** |||
| `list_members` | 멤버 목록 | `project_id` |
| `invite_member` | 멤버 초대 | `project_id`, `email`, `role` |
| `update_member_role` | 역할 변경 | `member_id`, `role` |
| `remove_member` | 멤버 제거 | `member_id` |
| **GitHub 통합** |||
| `create_github_branch` | 브랜치 생성 | `issue_id`, `base_branch?` |
| `link_github_issue` | 이슈 연결 | `issue_id`, `github_issue_url` |
| `link_github_pr` | PR 연결 | `issue_id`, `github_pr_url`, `auto_merge?` |

---

## 11. 팁과 모벨스트 사례

### 11.1 효율적인 사용법

1. **구체적인 프롬프트**: "이슈를 만들어줘"보다 "WEB 프로젝트에 로그인 기능 이슈를 High 우선순위로 만들어줘"
2. **문맥 유지**: 대화 맥락에서 프로젝트 ID를 반복해서 말할 필요 없음
3. **배치 활용**: 여러 이슈를 한 번에 처리할 때 배치 툴 사용

### 11.2 일반적인 실수

❌ **피해야 할 것**:
- 프로젝트 ID 대신 프로젝트 이름만 말하기
- 이슈 식별자 없이 "이슈 수정" 말하기
- 유효하지 않은 GitHub URL 제공

✅ **권장되는 것**:
- 프로젝트 키와 이슈 식별자 사용 (예: "WEB-123")
- GitHub URL 전체 복사/붙여넣기
- 한 명령어에 명확한 의도 전달

---

## 12. 지원 및 피드백

문제가 발생하면:
1. `mcp/hinear/.env.local` 설정 확인
2. Claude Desktop의 MCP 로그 확인
3. Smoke test 실행: `pnpm mcp:hinear:smoke`

버그 리포트:
- GitHub Issues: https://github.com/choiho/hinear/issues
- 문서 참조: `/specs/002-mcp-phase2-features/`

---

**마지막 업데이트**: 2026-03-26
**MCP 서버 버전**: 0.2.0
**총 툴 수**: 19개
