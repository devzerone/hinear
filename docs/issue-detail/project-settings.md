# Project Settings

## 목적

프로젝트 단위 설정 화면의 책임을 정의한다.

이 문서는 이슈 상세 자체보다 한 단계 바깥의 운영 화면을 다룬다. MVP 1의 핵심 구현 범위는 아니지만, 초대와 멤버 관리가 들어오는 시점부터 최소 설정 화면이 필요하다.

## 초기 범위

- 프로젝트 이름 수정
- 프로젝트 key 표시
- 프로젝트 type 표시
- 멤버 / 초대 진입
- 위험한 액션 진입

## 제외 범위

- 프로젝트 type 전환
- owner 이전
- 세분화된 notification settings
- webhook / integration 설정
- billing

## 화면 구성

### General

- `Project name`
- `Project key`
- `Project type`
- 저장 피드백

### Access

- `Members`
- `Invitations`
- owner/member 권한 설명

### Danger Zone

- 프로젝트 삭제
- 파괴적 액션 경고
- 확인 입력 또는 이중 확인

## 브레이크포인트 메모

- desktop/tablet은 좌측 navigation + 우측 settings panel 구조를 우선한다
- mobile은 단일 stack page로 단순화한다
- settings에서 issue detail로 돌아가는 경로가 분명해야 한다

## 기본 UX 원칙

- `member`는 읽기 전용 또는 제한된 설정만 본다
- `owner`만 변경/삭제 액션을 수행할 수 있다
- key는 초기 버전에서 읽기 전용으로 두는 편이 안전하다
- 위험한 액션은 primary flows와 시각적으로 분리한다

## 상태

- loading
- ready
- saving
- save error
- permission denied
- delete confirm

## 테스트 포인트

- owner만 일반 설정 변경을 저장할 수 있다
- member는 읽기만 가능하거나 수정 액션이 비활성화된다
- 삭제 액션은 확인 단계 없이는 실행되지 않는다

## 관련 문서

- [overview](/home/choiho/zerone/hinear/docs/issue-detail/overview.md)
- [project-model](/home/choiho/zerone/hinear/docs/issue-detail/project-model.md)
- [members](/home/choiho/zerone/hinear/docs/issue-detail/members.md)
- [invitations-ui](/home/choiho/zerone/hinear/docs/issue-detail/invitations-ui.md)
- [roadmap](/home/choiho/zerone/hinear/docs/issue-detail/roadmap.md)
