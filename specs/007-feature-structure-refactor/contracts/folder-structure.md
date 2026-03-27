# Contract: Folder Structure

## Purpose

`issues`와 `projects` feature에서 새 파일이 어디에 들어가야 하는지, 그리고 기존 파일이 어떤 규칙으로 이동해야 하는지 고정한다.

## Contract Rules

### 1. Feature root stays domain-oriented

- `actions/`, `lib/`, `repositories/`, `contracts.ts`, `types.ts`는 feature root에 남는다.
- 이 refactor의 기본 대상은 flat UI folders와 그 import graph다.

### 2. Every UI file belongs to exactly one sub-domain or `shared`

- `issues`: `board`, `detail`, `create`, `shared`
- `projects`: `workspace`, `overview`, `settings`, `create`, `shared`
- `shared`는 둘 이상의 sub-domain에서 실사용이 확인될 때만 허용된다.

### 3. Responsibility is encoded by folder, not only by file name

- `screens/`: route entry 또는 route-like orchestration
- `components/`: sub-domain support UI
- `providers/`: layout-wide or cross-screen modal/query wiring
- `stories/` or colocated story files: owner 기준

### 4. Tests and stories move with their owner

- `.test.tsx`, `.test.ts`, `.stories.tsx`, browser-test artifacts는 owning file과 함께 이동한다.
- test path만 남고 implementation이 비어 있는 orphan state를 허용하지 않는다.
- before/after ownership 추적은 `specs/007-feature-structure-refactor/file-ownership-map.md`를 기준 문서로 유지한다.

### 5. Mixed-responsibility files require explicit treatment

- 단순 move로 ownership이 더 모호해지는 파일은 split 또는 shared-exception 규칙을 먼저 적는다.
- 현재 계획의 주요 대상:
  - `project-operation-cards.tsx`
  - `project-modal-provider.tsx`

### 6. Route import updates must include issue creation and invite flows

- `src/app/projects/[projectId]/issues/new/page.tsx`는 `issues/create/screens/` entry를 직접 import해야 한다.
- `src/app/invite/[token]/page.tsx`는 invite 전용 entry를 통해 invitation UI를 소비해야 한다.

## Required Outcomes

- route file을 열지 않아도 feature folder만 보고 board/detail/workspace/settings 흐름을 찾을 수 있어야 한다.
- screen-level files와 supporting UI가 위치만으로 구분되어야 한다.
- 새 feature-specific card/form/panel을 추가할 때 destination 후보가 여러 개 나오지 않아야 한다.
