# Project Members

## 목적

프로젝트 접근 권한이 있는 멤버를 조회하고, 역할을 이해하고, owner가 멤버를 제거하는 화면과 규칙을 정리한다.

초기 버전의 역할은 `owner`와 `member`만 지원한다.

## 범위

- 멤버 목록 화면
- 역할 표시
- 현재 사용자 역할 확인
- owner의 멤버 제거
- 본인 제거 제한 규칙

## 제외 범위

- 역할 변경
- 게스트 권한
- 팀 단위 청구 / seat 관리
- 외부 디렉터리 동기화

## 화면

### Members List

- 프로젝트 멤버 목록
- 사용자 이름 또는 이메일
- 역할 뱃지
- 프로젝트 참여 시각
- `Remove` 액션

### Empty State

- 아직 멤버가 owner 한 명뿐인 경우
- `Invite member` CTA 노출

## 기본 UX 원칙

- `owner`는 멤버 목록과 제거 액션을 볼 수 있다
- `member`는 멤버 목록은 볼 수 있어도 제거 액션은 볼 수 없다
- 마지막 owner를 제거하는 흐름은 허용하지 않는다
- 본인 제거는 초기 버전에서 지원하지 않거나 별도 확인 단계를 둔다
- 제거 성공 후 관련 issue assignee는 fallback 정책을 따라야 한다

## assignee fallback 메모

- 제거된 사용자가 assignee였던 이슈는 `Unassigned`로 전환한다
- activity log에는 assignee 제거 이벤트가 남아야 한다

## 상태

### Members List

- loading
- empty
- ready
- removing
- remove error

## 테스트 포인트

- owner만 멤버 제거 액션을 실행할 수 있다
- member는 제거 액션을 실행할 수 없다
- 제거된 멤버는 프로젝트 접근 권한을 잃는다
- 제거된 멤버가 assignee였던 이슈는 `Unassigned`로 처리된다

## 관련 문서

- [project-model](/home/choiho/zerone/hinear/docs/issue-detail/project-model.md)
- [invitations](/home/choiho/zerone/hinear/docs/issue-detail/invitations.md)
- [invitations-ui](/home/choiho/zerone/hinear/docs/issue-detail/invitations-ui.md)
- [contracts](/home/choiho/zerone/hinear/docs/issue-detail/contracts.md)
- [supabase-schema](/home/choiho/zerone/hinear/docs/issue-detail/supabase-schema.md)
