# Research: Feature Structure Refactor

## Decision 1: Keep feature-root domain layers stable and reorganize UI beneath them

- **Decision**: Preserve `actions/`, `lib/`, `repositories/`, `contracts.ts`, and `types.ts` at the feature root for both `issues` and `projects`, while moving screen and component files into sub-domain folders below each feature.
- **Rationale**: The constitution already defines a domain-first layer model. The current pain is concentrated in flat UI folders, not in the action/lib/repository layout.
- **Alternatives considered**:
  - Reorganize every layer by sub-domain immediately: rejected because it would broaden the refactor into behavior-risky domain changes.
  - Leave the current flat `components/` folders intact and document conventions only: rejected because it would not solve the file-discovery problem from the spec.

## Decision 2: Use explicit sub-domains that mirror user-facing flows

- **Decision**: Adopt `board`, `detail`, `create`, and `shared` for `issues`, and `workspace`, `overview`, `settings`, `create`, and `shared` for `projects`.
- **Rationale**: Those groupings already exist in the route structure and component usage. They are small enough to give a contributor one obvious home for a new file without inventing an overly deep hierarchy.
- **Alternatives considered**:
  - Group by technical widget type only (`screens`, `cards`, `forms`, `panels`): rejected because it recreates the current cross-flow mixing problem.
  - Create many narrow folders such as `invitation`, `metadata`, `github`, `drawer`, `full-page`: rejected because it adds navigation overhead and weakens the primary user-flow grouping.

## Decision 3: Separate route-entry screens from supporting UI with a consistent folder rule

- **Decision**: Put route-entry or route-like orchestrators under `<sub-domain>/screens/`, and keep supporting UI in `<sub-domain>/components/`. Shared providers or cross-screen helpers go under `shared/`.
- **Rationale**: Current files like `project-workspace-screen.tsx`, `project-settings-screen.tsx`, `issue-detail-screen.tsx`, and `KanbanBoardView.tsx` are route-entry or screen-level orchestration points and should be immediately recognizable as such.
- **Alternatives considered**:
  - Encode responsibility only through naming (`*-screen.tsx`) without folder boundaries: rejected because the folder itself must communicate responsibility.
  - Move everything into `screens/` and keep internal helpers beside them: rejected because it blurs the line between orchestration and reusable UI.

## Decision 4: Keep tests and stories colocated with the files they verify

- **Decision**: Move `.test.tsx`, `.test.ts`, `.stories.tsx`, and browser-test artifacts with the owning file whenever a screen or component is relocated.
- **Rationale**: The codebase already colocates most tests with the implementation they verify. Preserving that pattern keeps refactors safer and supports the constitution’s TDD rule.
- **Alternatives considered**:
  - Centralize refactor-related tests under a new `tests/refactor` tree: rejected because ownership becomes less obvious after the move.
  - Leave tests behind temporarily and fix them later: rejected because it creates broken locality and increases the chance of orphaned test coverage.

## Decision 5: Prefer explicit route imports and scoped exports over a broad component barrel

- **Decision**: Update `src/app` routes to import explicit screen modules from their new sub-domain paths and avoid preserving a single top-level `features/issues/components/index.ts`-style barrel that re-flattens the mental model.
- **Rationale**: Current route files already import concrete screen files directly. Explicit screen imports keep the target structure understandable and prevent a new hidden flat layer from replacing the old one.
- **Alternatives considered**:
  - Preserve one broad `components/index.ts` barrel: rejected because it obscures sub-domain boundaries.
  - Remove all barrels everywhere: rejected because limited scoped exports may still be useful inside a sub-domain.

## Decision 6: Split mixed-responsibility files before or during relocation when needed

- **Decision**: Treat files that currently serve multiple sub-domains as explicit migration exceptions. In the current codebase, `project-operation-cards.tsx` and `project-modal-provider.tsx` require documented handling instead of a blind folder move.
- **Rationale**: `project-operation-cards.tsx` mixes create, settings, and invitation concerns, and `project-modal-provider.tsx` supports layout-wide behavior rather than a single screen. Forcing either into one sub-domain without rule changes would keep ambiguity alive.
- **Alternatives considered**:
  - Move mixed files unchanged into the most convenient sub-domain: rejected because it creates misleading ownership.
  - Postpone all mixed files to a later refactor: rejected because they are central to the current navigation ambiguity.

## Decision 7: Validate this refactor primarily through build/test stability and flow smoke checks

- **Decision**: Use the existing repository validation commands and focused smoke checks on project workspace, project settings, issue board, and issue detail flows to prove behavior has not changed.
- **Rationale**: The feature goal is structural clarity without user-facing changes. Existing tests and route/component coverage are the best signal that imports and ownership were updated safely.
- **Alternatives considered**:
  - Add new large end-to-end coverage before reorganizing files: rejected because it expands scope beyond the refactor’s purpose.
  - Rely on visual inspection only: rejected because broken imports and indirect regressions are easy to miss during a broad move.
