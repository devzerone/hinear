# Research: Activate Inactive Buttons

## Decision 1: Start with a screen-by-screen button inventory, not a repo-wide rewrite

- **Decision**: Limit the first implementation pass to the spec’s primary flows: project creation, project workspace, issue creation, issue detail, and project settings, and document every visible interactive control in those surfaces before changing behavior.
- **Rationale**: The user problem is about broken visible buttons in everyday flows. A bounded inventory creates a reviewable definition of done and avoids spending time on Storybook-only controls or lower-priority admin surfaces.
- **Alternatives considered**:
  - Audit every button in the repository at once: rejected because it would slow the fix and make the coverage record harder to trust.
  - Fix only the buttons we happen to notice during implementation: rejected because it risks leaving dead controls behind without documentation.

## Decision 2: Prefer wiring existing intent over inventing new behavior

- **Decision**: When a control already implies a clear result, connect it to the most local existing mechanism available: `Link`/router navigation for screen changes, component state for modal or panel toggles, URL query state for drawers and filters, and existing server actions or API endpoints for mutations.
- **Rationale**: The UI already communicates intent in many places. The safest, simplest fix is to complete that intent with the established route/action patterns already used elsewhere in the app.
- **Alternatives considered**:
  - Redesign button meaning while fixing dead controls: rejected because it broadens the feature and changes user expectations.
  - Introduce a new global button controller abstraction: rejected because current needs are concrete and local.

## Decision 3: Treat inactive-looking controls as a product bug even when the backend feature is incomplete

- **Decision**: If a feature is not truly supported yet, the UI must stop presenting the control as a normal active button. The implementation should either disable the control with an explanation, hide it behind a supported condition, or convert it into a documented follow-up item.
- **Rationale**: A button that looks tappable but does nothing is worse than a clearly unavailable control. This directly satisfies FR-004 and FR-008.
- **Alternatives considered**:
  - Leave the control clickable and add a console TODO: rejected because users still experience a broken path.
  - Keep the control visible but do nothing until backend support lands: rejected because it repeats the current problem.

## Decision 4: Standardize feedback around four outcomes

- **Decision**: Every in-scope button interaction should end in one of four clearly observable outcomes: navigation, UI state change, persisted data change, or explicit limitation/error feedback. Mutations additionally need pending state plus duplicate-submission prevention.
- **Rationale**: The spec’s user stories are about perceived responsiveness as much as raw functionality. A shared outcome model lets different components implement feedback consistently without forcing a single UI primitive everywhere.
- **Alternatives considered**:
  - Only verify that a handler exists: rejected because a handler can still feel broken if it provides no visible result.
  - Require toast messages for every action: rejected because navigation and inline state changes are often better feedback than a toast.

## Decision 5: Document button coverage as a first-class artifact

- **Decision**: Add a reviewable coverage record that classifies each inventoried control as `activated`, `intentionally-disabled`, or `deferred`, along with the user-visible result or limitation message.
- **Rationale**: User Story 3 explicitly requires contributors and reviewers to understand scope quickly. A coverage artifact prevents future regressions into undocumented dead buttons.
- **Alternatives considered**:
  - Depend only on code review context: rejected because scope becomes hard to reconstruct later.
  - Treat tests alone as the coverage record: rejected because tests do not always make exclusions obvious.

## Decision 6: Use targeted component and route-flow tests instead of broad end-to-end expansion

- **Decision**: Verify this feature through focused Vitest/Testing Library coverage on the screens and components that surface the dead controls, plus regression tests for mutation pending/error behavior where actions already exist.
- **Rationale**: The codebase already uses component and action tests extensively. Targeted tests give fast feedback and align with the constitution’s TDD requirement without forcing a brand-new end-to-end suite first.
- **Alternatives considered**:
  - Add only manual QA notes: rejected because this feature is prone to regress as new buttons are added.
  - Introduce a large browser test matrix immediately: rejected because it is heavier than needed for the current scope.

## Decision 7: Concrete first targets should include the project settings left navigation

- **Decision**: Treat the `General`, `Access`, `Members`, and `Danger zone` buttons in `src/features/projects/components/project-settings-screen.tsx` as confirmed dead-button candidates that must be converted into real section navigation or explicit non-interactive presentation in the first pass.
- **Rationale**: These controls are currently rendered as ordinary buttons and visually communicate clickability, but they do not change state, scroll, or navigate.
- **Alternatives considered**:
  - Leave them for a separate polish pass: rejected because they are a direct instance of the reported bug.
  - Hide them temporarily without documenting them: rejected because it obscures scope instead of recording it.
