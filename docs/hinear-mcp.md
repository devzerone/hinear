# Hinear MCP PRD

## Document Status

- Status: Draft
- Owner: Hinear product / platform
- Target release: Hinear MCP v0
- Transport: `stdio`
- Audience: product, platform, application engineers

## Summary

Hinear MCP는 Hinear의 프로젝트, 이슈, 댓글, 라벨, 멤버 관리 기능 일부를 LLM이 안전하게 호출할 수 있도록 제공하는 로컬 `stdio` MCP 서버다.

1차 목표는 웹 UI를 대체하는 것이 아니라, Hinear 운영과 개인 생산성을 돕는 “로컬 작업 보조 인터페이스”를 제공하는 것이다. 사용자는 자연어로 프로젝트를 찾고, 이슈를 조회하고, 이슈를 만들고, 상태를 바꾸고, 댓글을 남길 수 있어야 한다.

## Problem Statement

현재 Hinear의 핵심 기능은 웹 UI와 Next.js action / route 중심으로 제공된다. 이 구조는 브라우저 사용자에게는 적합하지만, LLM 에이전트가 Hinear의 데이터와 액션을 직접 활용하려면 별도 인터페이스가 필요하다.

현재 상태의 문제는 다음과 같다.

- LLM이 Hinear의 도메인 기능을 직접 호출할 수 있는 표준 인터페이스가 없다.
- 단순한 운영 작업도 사용자가 웹 UI를 직접 열고 여러 단계를 거쳐야 한다.
- Hinear 내부 비즈니스 로직은 존재하지만, 이를 에이전트 워크플로우에서 재사용할 수 있는 얇은 호출 계층이 없다.

이 PRD는 Hinear 도메인 기능 일부를 MCP tool로 노출하여, LLM이 Hinear를 "읽고, 검색하고, 갱신하는" 핵심 흐름을 수행할 수 있게 만드는 요구사항을 정의한다.

## Goal

Hinear MCP v0의 목표는 다음과 같다.

- LLM이 Hinear의 핵심 read/write 작업을 로컬에서 안전하게 수행할 수 있게 한다.
- 기존 Hinear의 도메인 규칙과 권한 모델을 최대한 재사용한다.
- 웹 UI와 MCP가 서로 다른 비즈니스 규칙을 갖지 않도록 설계한다.
- 작은 범위의 신뢰 가능한 MCP를 먼저 출시하고, 이후 확장 가능한 구조를 만든다.

## Non-Goals

이번 버전에서 하지 않는 일은 다음과 같다.

- 다중 사용자 공용 HTTP MCP 서버 제공
- SaaS형 원격 호스팅
- Hinear의 전체 웹 UI 기능을 모두 MCP로 복제
- 자유형 자연어를 tool 내부에서 과도하게 파싱하는 복잡한 NLP 로직
- service-role 기반의 광범위한 운영 권한 노출

## Why `stdio`

v0는 `stdio`를 전제로 한다.

선택 이유:

- 개인 로컬 환경에서 즉시 실행 가능하다.
- EC2, VPS, 장기 실행 서버, 도메인, HTTPS가 필요 없다.
- 로컬 개발 환경의 env와 인증 구성을 그대로 재사용하기 쉽다.
- 초기 MCP 사용자는 내부 팀 또는 개발자일 가능성이 높다.

결론적으로 v0는 “공용 서버”보다 “로컬 도우미”에 가깝게 설계한다.

## Users

### Primary users

- Hinear를 개발하거나 운영하는 내부 개발자
- LLM 에이전트를 활용해 Hinear 작업을 자동화하려는 파워 유저

### Secondary users

- QA / PM / 운영 담당자
- 이후 원격 MCP로 확장될 경우 내부 업무 자동화 사용자

## User Jobs

사용자는 Hinear MCP를 통해 아래 작업을 더 빠르게 수행하고 싶어 한다.

- 내가 접근 가능한 프로젝트를 빠르게 찾기
- 특정 프로젝트의 이슈를 자연어 기준으로 검색하기
- 이슈 하나를 요약해서 읽기
- 자연어 요청을 바탕으로 이슈 생성하기
- 이슈 상태를 바꾸기
- 이슈에 댓글 남기기

## Success Metrics

v0 성공 기준은 다음과 같다.

- 핵심 6개 tool이 로컬 `stdio` 환경에서 안정적으로 동작한다.
- 프로젝트 조회, 이슈 검색, 이슈 생성, 상태 변경, 댓글 작성이 실제 Hinear 데이터에 반영된다.
- 웹 UI와 MCP 간 권한/상태 규칙 불일치가 발생하지 않는다.
- read tool과 단일 write tool 기준 주요 실패 케이스가 구조화된 에러로 반환된다.

정성 지표:

- 사용자가 “웹 UI를 열지 않고도” 자주 하는 운영 작업을 수행할 수 있다고 느낀다.
- 에이전트가 Hinear에 대해 유용한 read/act loop를 수행할 수 있다.

## Primary Use Cases

### Use case 1

사용자 요청:
"이번 주 내 마감인데 아직 triage인 이슈 찾아줘"

기대 흐름:

```text
list_projects
-> search_issues
-> 결과 요약
```

### Use case 2

사용자 요청:
"프로젝트 A에 버그 이슈 하나 만들어줘"

기대 흐름:

```text
list_projects
-> create_issue
-> 생성된 identifier / URL 반환
```

### Use case 3

사용자 요청:
"이 이슈 done으로 바꾸고 코멘트 남겨줘"

기대 흐름:

```text
update_issue_status
-> add_comment
-> 최종 요약 반환
```

### Use case 4

사용자 요청:
"내가 맡은 high priority 이슈만 요약해줘"

기대 흐름:

```text
search_issues
-> 결과 요약
```

## Product Requirements

### Release scope: v0

v0는 아래 6개 tool을 제공해야 한다.

- `list_projects`
- `search_issues`
- `get_issue_detail`
- `create_issue`
- `update_issue_status`
- `add_comment`

이 6개만으로도 Hinear의 핵심 운영 루프를 지원할 수 있다.

### Future scope

v1 이후 확장 후보:

- `batch_update_issues`
- `list_labels`
- `create_label`
- `update_issue_labels`
- `list_project_members`
- `invite_project_member`
- `update_project_member_role`
- `generate_github_branch_for_issue`
- `apply_issue_template`
- `get_notification_preferences`
- `update_notification_preferences`

## Functional Requirements

### FR-1 `list_projects`

목적:
현재 사용자에게 접근 가능한 프로젝트 목록을 반환한다.

지원 입력:

- `include_archived?: boolean`
- `limit?: number`

반환 정보:

- project id
- project name
- project key
- project type
- current user role
- archived 여부
- short summary

동작 요구사항:

- 현재 세션 사용자 기준으로 접근 가능한 프로젝트만 반환해야 한다.
- archive 필터가 적용되어야 한다.
- 응답은 LLM이 후속 tool 호출에 사용할 수 있게 구조화되어야 한다.

구현 참고:

- [get-projects-by-user-action.ts](/home/choiho/zerone/hinear/src/features/projects/actions/get-projects-by-user-action.ts)

의사코드:

```text
resolve current user
fetch accessible projects
apply archived filter
apply limit
return compact list + summary
```

### FR-2 `search_issues`

목적:
프로젝트 내 이슈를 검색하고 필터링한다.

지원 입력:

- `project_id: string`
- `query?: string`
- `status?: string[]`
- `priority?: string[]`
- `assignee_id?: string`
- `label_ids?: string[]`
- `due_before?: string`
- `due_after?: string`
- `limit?: number`

반환 정보:

- issue id
- identifier
- title
- status
- priority
- assignee
- due date
- labels
- updated at
- short summary

동작 요구사항:

- 대상 프로젝트 접근 권한이 없으면 실패해야 한다.
- 필터 조합이 가능해야 한다.
- 기본 응답은 compact해야 한다.
- 후속 tool에서 사용 가능한 식별자를 포함해야 한다.

구현 참고:

- [search-issues-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/search-issues-action.ts)
- [route.ts](/home/choiho/zerone/hinear/src/app/api/issues/search/route.ts)

의사코드:

```text
validate project access
normalize filters
search issues
shape compact result
return matches + summary
```

### FR-3 `get_issue_detail`

목적:
이슈 상세 정보를 조회한다.

지원 입력:

- `issue_id: string`
- `include_comments?: boolean`
- `include_activity?: boolean`
- `comment_limit?: number`
- `activity_limit?: number`

반환 정보:

- issue metadata
- description
- labels
- recent comments
- recent activity
- short summary

동작 요구사항:

- issue가 속한 프로젝트에 read access가 있어야 한다.
- 긴 댓글 / 긴 activity는 기본적으로 제한된 수만 반환해야 한다.
- LLM이 요약과 후속 액션에 바로 활용할 수 있는 구조여야 한다.

구현 참고:

- [issue-detail-loader.ts](/home/choiho/zerone/hinear/src/features/issues/lib/issue-detail-loader.ts)
- [route.ts](/home/choiho/zerone/hinear/src/app/api/issues/[issueId]/route.ts)

의사코드:

```text
resolve issue and project
validate access
load read model
trim comments/activity
return detail + summary
```

### FR-4 `create_issue`

목적:
새 이슈를 생성한다.

지원 입력:

- `project_id: string`
- `title: string`
- `description?: string`
- `status?: string`
- `priority?: string`
- `assignee_id?: string`
- `labels?: string[]`
- `due_date?: string`

반환 정보:

- created issue id
- identifier
- title
- status
- priority
- issue URL 또는 route path
- short summary

동작 요구사항:

- project access 및 create permission을 확인해야 한다.
- title / description은 validation 및 sanitization을 거쳐야 한다.
- label name 또는 label id 정책은 명확하게 정의해야 한다.
- 생성 후 식별 가능한 결과를 반환해야 한다.

설계 메모:

- "자연어로 이슈 생성"은 tool이 모든 자연어를 해석한다는 뜻이 아니라, LLM이 자연어를 구조화된 필드로 바꾼 뒤 tool을 호출한다는 의미로 정의한다.

구현 참고:

- [create-issue-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/create-issue-action.ts)

의사코드:

```text
validate project access
sanitize fields
resolve labels
create issue
return created metadata + route
```

### FR-5 `update_issue_status`

목적:
기존 이슈의 상태를 변경한다.

지원 입력:

- `issue_id: string`
- `status: enum`
- `reason?: string`
- `comment_on_change?: string`

반환 정보:

- issue id
- previous status
- next status
- updated at
- short summary

동작 요구사항:

- issue access와 update permission을 확인해야 한다.
- 허용되지 않은 상태 전이는 실패해야 한다.
- 상태 변경 후 후속 댓글 옵션을 지원할 수 있어야 한다.

구현 참고:

- [update-issue-status-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/update-issue-status-action.ts)

의사코드:

```text
validate issue access
load current state
validate transition
persist status change
optionally append comment
return mutation summary
```

### FR-6 `add_comment`

목적:
이슈에 댓글을 추가한다.

지원 입력:

- `issue_id: string`
- `body: string`
- `parent_comment_id?: string`

반환 정보:

- comment id
- issue id
- created at
- author summary
- short summary

동작 요구사항:

- issue read/write access를 확인해야 한다.
- comment body validation / sanitization을 적용해야 한다.
- 생성 결과는 후속 참조가 가능해야 한다.

구현 참고:

- [create-comment-action.ts](/home/choiho/zerone/hinear/src/features/comments/actions/create-comment-action.ts)

의사코드:

```text
validate access
sanitize comment body
create comment
return compact result + summary
```

## Secondary Requirements

v0 이후 우선순위가 높은 기능은 다음과 같다.

### SR-1 `batch_update_issues`

목표:
여러 이슈의 상태 / 우선순위 / 담당자 등을 일괄 수정한다.

요구사항:

- `dry_run`을 지원해야 한다.
- partial failure를 구조화해 반환해야 한다.
- bulk mutation은 권한 검사를 개별 issue 기준으로 수행해야 한다.

구현 참고:

- [batch-update-issues-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/batch-update-issues-action.ts)

### SR-2 label tools

권장 분리:

- `list_labels`
- `create_label`
- `update_issue_labels`

구현 참고:

- [get-labels-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/get-labels-action.ts)
- [create-label-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/create-label-action.ts)
- [update-issue-labels-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/update-issue-labels-action.ts)

### SR-3 member tools

권장 분리:

- `list_project_members`
- `invite_project_member`
- `update_project_member_role`

구현 참고:

- [list-members-action.ts](/home/choiho/zerone/hinear/src/features/project-members/actions/list-members-action.ts)
- [invite-project-member-action.ts](/home/choiho/zerone/hinear/src/features/projects/actions/invite-project-member-action.ts)

## Advanced Requirements

### AR-1 GitHub branch generation

목표:
이슈 기반 브랜치 이름을 제안하거나 생성한다.

요구사항:

- 기본은 proposal-only여야 한다.
- 실제 생성은 explicit execute flag가 있을 때만 수행한다.

구현 참고:

- [route.ts](/home/choiho/zerone/hinear/src/app/internal/issues/[issueId]/github/branch/route.ts)

### AR-2 issue template application

목표:
이슈 템플릿 기반 초안 또는 생성 흐름을 지원한다.

구현 참고:

- [apply-issue-template-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/apply-issue-template-action.ts)

### AR-3 notification preferences

목표:
사용자 알림 설정을 읽고 갱신한다.

구현 참고:

- [update-notification-preferences-action.ts](/home/choiho/zerone/hinear/src/features/notifications/actions/update-notification-preferences-action.ts)

## UX Requirements For Tools

모든 tool은 다음 UX 원칙을 따른다.

- 입력은 구조화되어야 한다.
- 응답은 compact JSON + human summary를 함께 포함해야 한다.
- 식별자는 다음 tool에서 재사용 가능해야 한다.
- 긴 payload는 기본적으로 제한되어야 한다.
- destructive 작업은 가능하면 preview 또는 explicit execute 모델을 사용해야 한다.

예시 출력 형식:

```text
{
  "data": {...},
  "summary": "이번 주 내 마감인 triage 이슈 3개를 찾았습니다."
}
```

## Non-Functional Requirements

### NFR-1 Correctness

- 웹 UI와 MCP가 같은 도메인 규칙을 따라야 한다.
- 상태 전이, 권한, validation이 웹 경로와 어긋나면 안 된다.

### NFR-2 Security

- v0는 사용자 세션 기반 권한 모델을 우선한다.
- service-role 기반 광권한 MCP는 기본값이 아니어야 한다.
- destructive tool은 최소한의 필요한 권한으로만 실행되어야 한다.

### NFR-3 Reliability

- 실패는 구조화된 에러로 반환해야 한다.
- 부분 성공/부분 실패가 가능한 작업은 결과를 구분해서 보여줘야 한다.

### NFR-4 Maintainability

- MCP tool은 domain logic를 복제하지 않아야 한다.
- tool layer와 adapter layer가 분리되어야 한다.
- 테스트는 adapter와 core flows를 중심으로 작성 가능해야 한다.

### NFR-5 Performance

- 기본 조회는 compact payload를 반환해야 한다.
- 긴 comment/activity payload는 제한해야 한다.
- 한 번의 tool 호출은 후속 의사결정에 충분한 정보만 담아야 한다.

## Auth and Permission Model

### Recommended model

사용자 세션 기반 MCP

요구사항:

- MCP는 특정 사용자 세션 또는 사용자 토큰 기준으로 동작해야 한다.
- 사용자가 웹에서 할 수 없는 작업을 MCP도 할 수 없어야 한다.

장점:

- 제품 권한 모델과 일치한다.
- 실수 가능성이 낮다.

### Deferred model

service-role 기반 admin MCP

이 모델은 별도 admin MCP로 분리하는 것이 바람직하다.

이유:

- 일반 사용자용 MCP와 운영용 고권한 MCP를 섞으면 위험하다.
- audit / permission boundary가 흐려진다.

## Error Model

모든 tool은 구조화된 에러를 반환해야 한다.

권장 형태:

```text
error: {
  code,
  message,
  retryable,
  details?
}
```

권장 에러 코드:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `INTEGRATION_ERROR`
- `INTERNAL_ERROR`

## Architecture

### High-level flow

```text
LLM Client
  -> stdio transport
  -> Hinear MCP Server
  -> tool handler
  -> adapter layer
  -> domain service / repository
  -> Supabase / GitHub / internal logic
```

### Layer responsibilities

- `tools/`: MCP input/output boundary
- `adapters/`: Hinear 내부 기능 호출과 orchestration
- `domain service / repository`: 실제 비즈니스 규칙
- `presenters/`: MCP 응답용 compact shaping
- `schemas/`: validation 및 enum 정의

### Required implementation principle

MCP는 가능하면 UI용 server action을 직접 두껍게 감싸지 않고, domain service / repository를 재사용해야 한다.

권장 구조:

```text
Web UI -> server action -> domain service / repository
MCP -> tool handler -> same domain service / repository
```

피해야 할 구조:

- request context에 강하게 의존하는 server action 재사용
- tool 내부에서 독자적인 비즈니스 규칙 구현
- UI response shape를 MCP에 그대로 노출

## Recommended Project Structure

```text
mcp/hinear/
├─ src/
│  ├─ index.ts
│  ├─ server.ts
│  ├─ auth/
│  │  └─ session.ts
│  ├─ tools/
│  │  ├─ list-projects.ts
│  │  ├─ search-issues.ts
│  │  ├─ get-issue-detail.ts
│  │  ├─ create-issue.ts
│  │  ├─ update-issue-status.ts
│  │  ├─ add-comment.ts
│  │  ├─ batch-update-issues.ts
│  │  ├─ list-labels.ts
│  │  ├─ create-label.ts
│  │  ├─ update-issue-labels.ts
│  │  ├─ list-project-members.ts
│  │  ├─ invite-project-member.ts
│  │  ├─ update-project-member-role.ts
│  │  ├─ generate-github-branch.ts
│  │  ├─ apply-issue-template.ts
│  │  ├─ get-notification-preferences.ts
│  │  └─ update-notification-preferences.ts
│  ├─ adapters/
│  │  ├─ projects.ts
│  │  ├─ issues.ts
│  │  ├─ comments.ts
│  │  ├─ labels.ts
│  │  ├─ members.ts
│  │  ├─ github.ts
│  │  └─ notifications.ts
│  ├─ presenters/
│  │  └─ mcp-presenters.ts
│  ├─ schemas/
│  │  ├─ project.ts
│  │  ├─ issue.ts
│  │  ├─ comment.ts
│  │  └─ common.ts
│  └─ lib/
│     ├─ errors.ts
│     ├─ permissions.ts
│     └─ logger.ts
├─ package.json
└─ README.md
```

## Dependencies On Existing Hinear Code

핵심 참고 지점:

- 프로젝트 조회:
  [get-projects-by-user-action.ts](/home/choiho/zerone/hinear/src/features/projects/actions/get-projects-by-user-action.ts)
- 이슈 검색:
  [search-issues-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/search-issues-action.ts)
- 이슈 검색 API:
  [route.ts](/home/choiho/zerone/hinear/src/app/api/issues/search/route.ts)
- 이슈 상세:
  [issue-detail-loader.ts](/home/choiho/zerone/hinear/src/features/issues/lib/issue-detail-loader.ts)
- 이슈 상세 API:
  [route.ts](/home/choiho/zerone/hinear/src/app/api/issues/[issueId]/route.ts)
- 이슈 생성:
  [create-issue-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/create-issue-action.ts)
- 상태 변경:
  [update-issue-status-action.ts](/home/choiho/zerone/hinear/src/features/issues/actions/update-issue-status-action.ts)
- 댓글 생성:
  [create-comment-action.ts](/home/choiho/zerone/hinear/src/features/comments/actions/create-comment-action.ts)

보조 레이어:

- [server-projects-repository.ts](/home/choiho/zerone/hinear/src/features/projects/repositories/server-projects-repository.ts)
- [server-issues-repository.ts](/home/choiho/zerone/hinear/src/features/issues/repositories/server-issues-repository.ts)
- [supabase-issues-repository.ts](/home/choiho/zerone/hinear/src/features/issues/repositories/supabase-issues-repository.ts)
- [SupabaseCommentsRepository.ts](/home/choiho/zerone/hinear/src/features/comments/repositories/SupabaseCommentsRepository.ts)

## Rollout Plan

### Phase 1

제공 범위:

- `list_projects`
- `search_issues`
- `get_issue_detail`
- `create_issue`
- `update_issue_status`
- `add_comment`

출시 기준:

- 로컬 `stdio` 실행 가능
- 6개 tool 수동 검증 완료
- 권한 체크 경로 확인 완료
- 구조화된 에러 응답 보장

### Phase 2

제공 범위:

- `batch_update_issues`
- label tools

출시 기준:

- dry-run 지원
- partial failure 응답 포맷 정리

### Phase 3

제공 범위:

- member tools
- GitHub branch tool
- template tools
- notification tools

출시 기준:

- 외부 연동과 권한 민감 기능의 경계 명확화

## Risks

- 웹 UI와 MCP가 서로 다른 validation / permission path를 가지면 동작이 어긋날 수 있다.
- request context 전제 코드가 많으면 MCP adapter 분리가 예상보다 커질 수 있다.
- bulk mutation이나 member 관리 기능은 작은 실수도 영향 범위가 크다.
- service-role 기반 구현으로 빠르게 시작하면 이후 보안 부채가 커질 수 있다.

## Open Questions

- MCP의 인증은 로컬 사용자 세션을 어떤 방식으로 주입할 것인가
- label 입력은 이름 기반, id 기반, 또는 둘 다 지원할 것인가
- issue URL은 절대 URL로 반환할지 route path로 반환할지
- 상태 변경 시 comment 자동 작성 정책을 기본값으로 둘지 옵션으로 둘지
- v0에서 activity/comment full payload를 어디까지 허용할지

## Final Recommendation

Hinear MCP v0는 “작고 신뢰할 수 있는 로컬 운영 인터페이스”로 정의한다. 첫 출시 범위는 핵심 6개 tool에 집중하고, 읽기와 단일 write flow를 안정화한 뒤, bulk mutation과 협업 기능은 다음 단계로 넘긴다.

이 문서의 기준 설계는 다음 한 줄로 요약할 수 있다.

Hinear MCP는 웹 UI의 복제본이 아니라, Hinear 도메인 기능을 LLM이 안전하게 호출하도록 감싼 `stdio` 기반 product surface다.
