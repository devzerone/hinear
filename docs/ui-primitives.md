# UI Primitives

현재 UI primitive는 `pen/components.pen`과 `pen/Hinear.pen`에 등록된 토큰과 컴포넌트 구조를 기준으로 맞추고 있다.

## 원칙

- 전역 스타일은 `src/app/globals.css`의 `@theme` 토큰 중심으로 유지한다.
- 수기 클래스나 `:root` 별칭은 가능한 한 추가하지 않는다.
- primitive는 먼저 `pen`의 기본 상태를 맞춘다.
- Search, Avatar, Project switcher처럼 구조가 다른 경우는 억지로 한 컴포넌트에 합치지 않고 분리한다.
- Storybook 스토리를 같이 추가해서 상태를 바로 비교할 수 있게 한다.

## 토큰 소스

- `pen/components.pen`
- `pen/Hinear.pen`
- 등록 위치: [src/app/globals.css](/home/choiho/zerone/hinear/src/app/globals.css)

현재 `globals.css`에는 `pen`에서 온 토큰과 최소 `body` 스타일만 남아 있다.

## 구현된 Primitive

- `Button`
  - 기준 노드: `cmpBtnPrimary`, `cmpBtnSecondary`
  - 파일: [src/components/primitives/Button.tsx](/home/choiho/zerone/hinear/src/components/primitives/Button.tsx)
- `Chip`
  - 기준 노드: `cmpChipNeutral`, `cmpChipAccent`, `cmpChipOutline`, `cmpChipDanger`, `wbZNN`, `995lk`
  - 파일: [src/components/primitives/Chip.tsx](/home/choiho/zerone/hinear/src/components/primitives/Chip.tsx)
- `Field`
  - 기준 노드: `cmpFieldInput`
  - 파일: [src/components/primitives/Field.tsx](/home/choiho/zerone/hinear/src/components/primitives/Field.tsx)
- `Select`
  - 기준 노드: `cmpFieldSelect`
  - 파일: [src/components/primitives/Select.tsx](/home/choiho/zerone/hinear/src/components/primitives/Select.tsx)
- `SidebarItem`
  - 기준 노드: `cmpNavItemDefault`, `cmpNavItemActive`, `cmpProjectItemDefault`, `cmpProjectItemActive`
  - 내장 variant: `issues`, `triage`, `active`, `backlog`, `roadmap`
  - 파일: [src/components/primitives/SidebarItem.tsx](/home/choiho/zerone/hinear/src/components/primitives/SidebarItem.tsx)
- `ProjectSelect`
  - 기준 노드: `PGTKk`
  - 관련 구조: `ProjectSwitcher`, `OpenDashboardLink`
  - 파일: [src/components/primitives/ProjectSelect.tsx](/home/choiho/zerone/hinear/src/components/primitives/ProjectSelect.tsx)
- `SidebarDesktop`
  - 기준 노드: `1YjGD` (`Sidebar/Desktop`)
  - 조합 구조: `ProjectSwitcher`, `OpenDashboardLink`, `SidebarItem`
  - 파일: [src/components/primitives/SidebarDesktop.tsx](/home/choiho/zerone/hinear/src/components/primitives/SidebarDesktop.tsx)
- `HeaderAction`
  - 기준 노드: `cmpHeaderActionPrimary`, `cmpHeaderActionBoard`, `cmpHeaderActionFilter`
  - 파일: [src/components/primitives/HeaderAction.tsx](/home/choiho/zerone/hinear/src/components/primitives/HeaderAction.tsx)
- `HeaderSearchField`
  - 기준 노드: `cmpHeaderActionSearch`
  - 파일: [src/components/primitives/HeaderAction.tsx](/home/choiho/zerone/hinear/src/components/primitives/HeaderAction.tsx)
- `BoardAddCard`
  - 기준 노드: `cmpBoardCardAdd`
  - 파일: [src/components/primitives/BoardAddCard.tsx](/home/choiho/zerone/hinear/src/components/primitives/BoardAddCard.tsx)
- `BoardIssueCard`
  - 기준 노드: `cmpBoardCardIssue`
  - 파일: [src/components/primitives/BoardIssueCard.tsx](/home/choiho/zerone/hinear/src/components/primitives/BoardIssueCard.tsx)
- `Avatar`
  - 기준 노드: `T0CIx`
  - 동작: `src`가 있으면 이미지, 없으면 `name` 또는 `fallback`에서 두 글자 이니셜 표시
  - 파일: [src/components/primitives/Avatar.tsx](/home/choiho/zerone/hinear/src/components/primitives/Avatar.tsx)

공용 export 경로는 기본적으로 [src/components/primitives/index.ts](/home/choiho/zerone/hinear/src/components/primitives/index.ts)에 모아두고, 새 primitive 추가 시 기존 작업과 충돌이 없도록 함께 정리한다.

## Storybook

- 설정: [.storybook/main.ts](/home/choiho/zerone/hinear/.storybook/main.ts), [.storybook/preview.ts](/home/choiho/zerone/hinear/.storybook/preview.ts)
- 실행: `pnpm storybook`
- 빌드 확인: `pnpm build-storybook`

대표 스토리 파일:

- [src/components/primitives/Button.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/Button.stories.tsx)
- [src/components/primitives/Chip.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/Chip.stories.tsx)
- [src/components/primitives/Field.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/Field.stories.tsx)
- [src/components/primitives/Select.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/Select.stories.tsx)
- [src/components/primitives/SidebarItem.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/SidebarItem.stories.tsx)
- [src/components/primitives/ProjectSelect.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/ProjectSelect.stories.tsx)
- [src/components/primitives/SidebarDesktop.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/SidebarDesktop.stories.tsx)
- [src/components/primitives/HeaderAction.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/HeaderAction.stories.tsx)
- [src/components/primitives/BoardAddCard.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/BoardAddCard.stories.tsx)
- [src/components/primitives/BoardIssueCard.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/BoardIssueCard.stories.tsx)
- [src/components/primitives/Avatar.stories.tsx](/home/choiho/zerone/hinear/src/components/primitives/Avatar.stories.tsx)

## 현재 주의사항

- primitive 일부는 `pen`의 기본 상태에 먼저 맞춘 상태라 hover, pressed, focus, disabled의 세부 값은 아직 덜 맞춰진 것이 있다.
- 앱 화면에는 예전 커스텀 클래스 의존이 남아 있을 수 있어서, primitive를 실제 화면에 붙이면서 치환 작업이 필요하다.
- `ProjectSwitcher`와 `HeaderSearchField`처럼 구조가 분리된 항목은 기존 단일 컴포넌트 가정으로 다시 합치지 않는 것이 좋다.
- `SidebarItem`은 네비게이션 상태를 개별 라벨 문자열로 흩뿌리지 않고 `variant` preset으로 우선 사용한다. 프로젝트 목록처럼 pen에서 별도 primitive가 있는 경우만 `kind="project"` + 커스텀 `label`/`icon` 조합을 유지한다.

## 다음 작업 추천

- issue board와 project workspace에 primitive를 실제로 치환
- pen 기준 hover/focus/disabled 상태 추가
- drawer, modal, card 단위 조합 컴포넌트 확장
- primitive 시각 비교용 reference story 정리
