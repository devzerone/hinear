# Contract: Import Boundaries

## Purpose

파일 이동 후 import graph가 다시 flat 구조로 무너지지 않도록 허용 경계를 정의한다.

## Boundary Rules

### 1. `src/app` routes import screen/provider entries only

- route files는 해당 feature sub-domain의 `screens/` 또는 `shared/providers/` entry만 직접 import한다.
- route가 leaf component를 직접 import하는 패턴은 새 구조에서 금지한다.

### 2. Screens may compose local components and feature-root domain logic

- `screens/`는 같은 sub-domain의 `components/`를 import할 수 있다.
- `screens/`는 feature root의 `actions/`, `lib/`, `hooks/`, `types.ts`를 import할 수 있다.
- `screens/`는 다른 sub-domain의 leaf component를 직접 참조하기보다 `shared/` 또는 명시적 public entry를 사용해야 한다.

### 3. Components stay downstream

- `components/`는 같은 sub-domain의 other components와 feature-root domain logic를 사용할 수 있다.
- `components/`가 route-only concern이나 page loader concern을 새로 소유하면 안 된다.

### 4. Shared is explicit, not a dumping ground

- `shared/components` 또는 `shared/providers`로 이동한 파일은 최소 두 consumer를 설명할 수 있어야 한다.
- “언젠가 재사용할 수도 있음”은 shared 승격 사유가 아니다.

### 5. Broad barrels must not flatten sub-domain intent

- 전체 `components/`를 한 번에 다시 export하는 broad barrel은 피한다.
- 필요하면 sub-domain scope의 작은 export surface만 둔다.
- route import는 가능하면 concrete screen path를 유지한다.
- `src/features/issues/index.ts` 같은 feature root entry는 broad UI barrel을 재-export하지 않는다.

## Known Exceptions To Handle Deliberately

- `project-modal-provider.tsx`: `src/app/projects/[projectId]/layout.tsx`가 소비하므로 `projects/shared/providers` 후보
- `project-operation-cards.tsx`: create/settings/invite 책임이 섞여 있어 split 또는 invite-specific entry 분리가 필요

## Validation Signals

- `pnpm typecheck`가 모든 rewritten import를 통과한다.
- `pnpm lint`에서 dead import / unused export / broken path가 남지 않는다.
- route file import만 봐도 어떤 screen이 route entry인지 바로 드러난다.
