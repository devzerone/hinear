# Invitations UI

## 목적

`team` 프로젝트에서 owner가 초대를 보내고, pending invitation을 관리하고, 사용자가 초대를 수락하는 화면 기준을 정의한다.

이 문서는 [invitations](/home/choiho/zerone/hinear/docs/issue-detail/invitations.md)의 도메인 규칙을 UI 흐름으로 풀어쓴다.

## 범위

- 초대 보내기
- pending invitation 목록
- invitation 재발송
- invitation 취소
- invitation 수락
- invitation 만료 / 중복 / 권한 실패 메시지

## 제외 범위

- 세분화된 역할 선택
- 공개 초대 링크
- 다중 프로젝트 일괄 초대
- 초대 분석 리포트

## 화면

### Project Settings / Members

- `Invite member` 버튼
- 이메일 입력
- pending invitation 목록
- invitation 상태
  - `pending`
  - `accepted`
  - `expired`
  - `revoked`

### Invitation Accept

- 프로젝트 이름
- 초대한 사람
- 프로젝트 type
- `Accept invitation`
- `Decline` 또는 진입 취소

## 기본 UX 원칙

- `owner`만 초대 액션을 볼 수 있다
- 이미 멤버인 이메일은 새 초대 대신 안내 메시지를 보여준다
- 같은 이메일에 pending 초대가 있으면 새로 만들기보다 `재발송` 또는 `만료 갱신`으로 처리한다
- 만료된 초대 링크는 수락 대신 `expired` 안내와 재초대 요청 문구를 보여준다
- 수락 성공 후에는 해당 프로젝트 보드로 이동한다

## 상태

### Invite Form

- idle
- submitting
- success
- duplicate invitation
- already member
- permission denied

### Invitation List

- empty
- with pending invitations
- resend in progress
- revoke in progress
- load error

### Invitation Accept

- loading
- requires auth
- pending
- expired
- already accepted
- revoked
- success

## 컴포넌트 메모

- invitation row에는 이메일, 초대자, 생성 시각, 만료 시각, 상태가 보여야 한다
- row action은 `Resend`, `Cancel` 정도로 제한한다
- destructive action은 owner만 노출한다
- mobile에서는 설정 화면 안에서 카드 스택으로 축약한다

## 테스트 포인트

- owner만 invite form을 볼 수 있다
- member는 invite form과 row action을 볼 수 없다
- 같은 이메일 pending invitation이 있으면 duplicate 생성이 아니라 재발송 경로를 탄다
- 만료된 초대는 accept 할 수 없다
- 초대 수락 성공 후 project 접근 권한이 생긴다

## 관련 문서

- [overview](/home/choiho/zerone/hinear/docs/issue-detail/overview.md)
- [invitations](/home/choiho/zerone/hinear/docs/issue-detail/invitations.md)
- [members](/home/choiho/zerone/hinear/docs/issue-detail/members.md)
- [project-settings](/home/choiho/zerone/hinear/docs/issue-detail/project-settings.md)
- [supabase-schema](/home/choiho/zerone/hinear/docs/issue-detail/supabase-schema.md)
