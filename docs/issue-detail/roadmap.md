# Roadmap

## 목적

현재 문서로 정의된 기능을 구현 우선순위 기준으로 묶는다.

> **진행 메모 (2026-03-25):**
> 아래 로드맵은 원래 목표 순서를 설명하는 문서다. 현재 구현 기준으로는 assignee, labels, board search/filter, batch actions, project/member access, notifications settings API까지 이미 상당 부분 진행되었다. 남은 큰 축은 알림 실제 전달, 검색/필터 UX 고도화, 일부 예외 경로 정리다.

핵심 전략은 먼저 혼자 쓸 수 있는 제품을 만들고, 그 다음 팀 협업과 알림을 얹는 것이다.

## MVP 1차

목표:

혼자 바로 사용할 수 있는 최소 제품을 완성한다.

포함 기능:

- 개인 프로젝트 생성
- 프로젝트별 이슈 관리
- 프로젝트별 identifier 발급
  - `PROJECTKEY-n`
- **이슈 보드 (칸반)** - 드래그앤드롭으로 상태 변경, 칸반 보드로 시각화
  - Triage, Backlog, Todo, In Progress, Done, Canceled 컬럼
  - 이슈 카드로 표시 (identifier, 제목, 우선순위, 라벨, 담당자)
  - 드래그앤드롭으로 컬럼 간 이동
- **이슈 생성** - Create Issue Modal/Page
  - 제목, 설명, 우선순위 입력
  - 마크다운 도구모음 지원
  - desktop/tablet에서는 생성 후 drawer 우선 오픈, 필요시 full page detail 진입
- 독립 `Issue Detail / Full page` route
- 이슈 제목 수정
- 상태 변경
  - `Triage`
  - `Backlog`
  - `Todo`
  - `In Progress`
  - `Done`
  - `Canceled`
- 우선순위 변경
- 설명 편집
- 코멘트 작성
- 활동 로그 표시
- metadata 표시
- 활동 로그의 `actor`, `field`, `from`, `to`, `createdAt`, `summary`
- 신규 이슈 기본 상태 `Triage`
- `Triage -> Backlog`
- `Triage -> Todo`
- PWA 설치 가능
- 브레이크포인트별 issue detail route 기준 정리

**MVP 1차 추가 기능:**

- **이슈 템플릿** - 자주 쓰는 패턴을 템플릿으로 제공 (버그 리포트, 기능 요청, 개선 사항 등)
- **이슈 검색 (기본)** - 제목으로 이슈 검색
- **마크다운 도구모음** - 설명/코멘트 작성 시 마크다운 도구모음 제공 (비개발자 친화적)

**원래 제외 기능 (당시 MVP 2차로 분류):**

- 담당자 변경
- 라벨 추가/삭제

현재 구현 메모:

- 담당자 변경 구현됨
- 라벨 추가/삭제 구현됨
- 보드 검색/필터는 URL 쿼리 + 서버 검색 API까지 연결됨
- 일괄 작업은 상태/담당자/우선순위 변경과 테스트까지 포함해 기본 동작이 갖춰짐

완료 기준:

- 개인 프로젝트 하나로 실제 이슈를 생성하고 관리할 수 있다
- 칸반 보드에서 이슈를 시각적으로 확인하고 상태를 변경할 수 있다
- 상태 변경과 설명/코멘트 흐름이 문제없이 동작한다
- activity log로 변경 이력을 읽을 수 있다
- full page detail route가 desktop source of truth로 동작한다
- tablet과 mobile에서도 issue open / create 흐름이 일관되게 동작한다

## MVP 2차

목표:

팀과 함께 사용할 수 있는 협업 구조를 완성한다.

포함 기능:

- 팀 프로젝트 생성
- `owner/member` 권한
- 프로젝트 초대
- 초대 수락
- 프로젝트 멤버 접근 제어
- 담당자 변경
- 라벨 추가/삭제
- 멤버가 이슈를 조회/수정/코멘트할 수 있음
- 제거된 멤버 접근 차단

**MVP 2차 추가 기능:**

- **낙관적 잠금 (Optimistic Locking)** - 버전 관리로 충돌 방지, 데이터 무결성 보장 (자세한 내용은 [optimistic-locking.md](/Users/choiho/zerone/hinear/docs/issue-detail/optimistic-locking.md) 참조)
- **멘션 시스템 (@username)** - 코멘트에서 멤버 멘션, 멘션된 사람에게 알림
- **이슈 구독** - 특정 이슈의 업데이트만 구독, 관련 있는 이슈만 추적
- **이슈 필터 고도화** - 상태 + 담당자 + 라벨 + 우선순위 조합 (복합 조건)
- **이슈 정렬** - 생성일, 수정일, 우선순위, 상태별 정렬 (오름차순/내림차순)

완료 기준:

- owner가 팀 프로젝트를 만들고 멤버를 초대할 수 있다
- 멤버는 해당 프로젝트 안에서 이슈를 함께 관리할 수 있다
- 프로젝트 외부 사용자는 접근할 수 없다

## MVP 3차

목표:

알림을 붙여서 실사용 운영 편의성을 높인다.

포함 기능:

- 웹 푸시 opt-in
- FCM token 저장
- background notification
- notification click 시 issue detail 이동
- 상태 변경 이벤트 알림
- assignee 지정 알림
- reminder 알람
- 프로젝트 접근 권한 있는 사용자만 알림 대상 포함

완료 기준:

- 사용자가 알림을 허용하면 관련 이슈 알림을 받을 수 있다
- 알림 클릭 시 해당 이슈 화면으로 이동한다
- reminder 시각에 알림이 전송된다

## 나중 기능

- compact issue drawer
- breakpoint별 고도화된 정보 밀도 조정
- **필드 단위 잠금 (Field-level Locking)** - 제목/설명/상태를 독립적으로 잠금, 부분적 동시 편집 가능
- **CRDT (Yjs)** - Notion 스타일 완벽한 동시 편집, 오프라인 지원 (자세한 내용은 [optimistic-locking.md](/Users/choiho/zerone/hinear/docs/issue-detail/optimistic-locking.md)의 "다음 단계" 참조)
- 세분화된 권한
- 프로젝트 템플릿
- 대시보드와 리포트
- 네이티브 앱 수준 알림 제어
- 이슈 관계 (하위 작업/의존성)
- 이슈 복제/클론
- 이슈 핀/즐겨찾기
- 이슈 미리보기 (링크 hover)
- 다크 모드 지원
- 리마인더/만료 알림
- 알림 설정 세분화
- 이슈 수/상태별 요약 통계
- 최근 본 이슈 히스토리
- 변경 요약/주간 리포트
- 이슈 내보내기/가져오기 (CSV/JSON)

## 추천 순서

1. 개인 프로젝트 + **이슈 보드 (칸반)**
2. 이슈 생성 (Create Issue Modal/Page)
3. 이슈 템플릿 + 검색 + 마크다운 도구모음
4. activity log 완성
5. create issue -> **drawer** 흐름 고정 (필요시 full page 이동)
6. breakpoint별 route rule 고정
7. 팀 프로젝트 + 초대
8. **낙관적 잠금 (Optimistic Locking)** - 팀 협업 시 데이터 무결성 보장
9. assignee + labels + 멘션 + 구독
10. 필터 + 정렬
11. 웹 푸시
12. reminder
13. **필드 단위 잠금** (선택) - 부분적 동시 편집 필요 시
14. **CRDT (Yjs)** (선택) - 완벽한 동시 편집 필요 시

## 관련 문서

- [overview](/Users/choiho/zerone/hinear/docs/issue-detail/overview.md)
- [implementation-plan](/Users/choiho/zerone/hinear/docs/issue-detail/implementation-plan.md)
- [project-model](/Users/choiho/zerone/hinear/docs/issue-detail/project-model.md)
- [invitations](/Users/choiho/zerone/hinear/docs/issue-detail/invitations.md)
- [optimistic-locking](/Users/choiho/zerone/hinear/docs/issue-detail/optimistic-locking.md) - 낙관적 잠금 구현 가이드
