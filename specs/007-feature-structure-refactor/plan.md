# Implementation Plan: Feature Structure Refactor

**Branch**: `007-feature-structure-refactor` | **Date**: 2026-03-27 | **Spec**: [/home/choiho/zerone/hinear/specs/007-feature-structure-refactor/spec.md](/home/choiho/zerone/hinear/specs/007-feature-structure-refactor/spec.md)
**Input**: Feature specification from `/specs/007-feature-structure-refactor/spec.md`

## Summary

Reorganize the `issues` and `projects` feature areas around a small set of sub-domains and explicit responsibility tiers without changing product behavior. The plan keeps domain logic layers stable at the feature root, moves route-entry screens into sub-domain `screens/` folders, colocates supporting UI/tests/stories with the owning sub-domain, and updates route imports plus migration documentation so contributors can navigate the codebase from folder names alone.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js runtime, React 19.2.4, Next.js 16.2.0 (App Router)  
**Primary Dependencies**: Supabase, `@tanstack/react-query` 5.95.2, sonner, lucide-react, Vitest 4.1.0, Testing Library, Biome  
**Storage**: Supabase PostgreSQL for persisted project and issue state; repository files for feature specs and migration documentation  
**Testing**: Vitest, Testing Library, colocated component/action/lib/repository tests, Biome linting, TypeScript typecheck  
**Target Platform**: Next.js web application / installable PWA for modern browsers with Node.js build runtime  
**Project Type**: Web application  
**Performance Goals**: Preserve existing application performance budgets from the constitution; the refactor must not introduce measurable regressions in primary project and issue flows  
**Constraints**: No user-facing behavior changes; preserve route behavior, validation, access control, and issue/project workflows; keep destination folders few and predictable; align with existing feature-layering rules in the constitution  
**Scale/Scope**: First-pass structural refactor limited to `src/features/issues`, `src/features/projects`, affected `src/app` route imports, and colocated tests/stories/docs for board, detail, workspace, overview, settings, and project creation flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-Phase 0 Gate Review**

- **Project-First**: PASS. Project-scoped routes, repositories, and access rules remain intact; this work changes file locations and imports, not ownership boundaries.
- **Issue-Centric Design**: PASS. The target structure gives issue detail a first-class `detail` sub-domain instead of leaving detail screens mixed with board files.
- **Domain-Driven Design**: PASS. `contracts.ts`, `types.ts`, `lib/`, `repositories/`, and `actions/` stay as feature-level layers; only UI and adjacent tests/stories are reorganized by sub-domain and responsibility.
- **Incremental Completeness**: PASS. The refactor is limited to active issue/project flows and explicitly excludes behavior changes, redesign, or new capabilities.
- **Test-Driven Development**: PASS with implementation requirement. Moved files keep colocated tests, and the validation plan requires targeted verification plus full `typecheck`, `lint`, and `test`.
- **Security & Data Integrity**: PASS. No RLS, optimistic-locking, auth, or data mutation semantics change.
- **Installable PWA**: PASS. No manifest, service worker, or offline behavior changes are planned.
- **Simplicity**: PASS. The design intentionally uses a small folder vocabulary: `board/detail/create/shared` for issues and `workspace/overview/settings/create/shared` for projects.

**Post-Phase 1 Design Re-Check**

- PASS. The design artifacts keep the feature-root domain layers stable, use explicit sub-domain folders only where current code already demonstrates real user-facing flows, and avoid introducing an abstraction-heavy export surface.

## Project Structure

### Documentation (this feature)

```text
specs/007-feature-structure-refactor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── folder-structure.md
│   └── import-boundaries.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── projects/
│   │   ├── [projectId]/
│   │   │   ├── page.tsx
│   │   │   ├── overview/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── issues/[issueId]/page.tsx
│   │   └── new/page.tsx
│   └── invite/[token]/page.tsx
├── components/
├── features/
│   ├── issues/
│   │   ├── actions/
│   │   ├── board/
│   │   │   ├── components/
│   │   │   └── screens/
│   │   ├── create/
│   │   │   └── screens/
│   │   ├── detail/
│   │   │   ├── components/
│   │   │   └── screens/
│   │   ├── shared/
│   │   │   └── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── presenters/
│   │   ├── repositories/
│   │   ├── contracts.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── projects/
│   │   ├── actions/
│   │   ├── create/
│   │   │   ├── components/
│   │   │   └── screens/
│   │   ├── overview/
│   │   │   └── screens/
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   └── screens/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   └── providers/
│   │   ├── workspace/
│   │   │   ├── components/
│   │   │   └── screens/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── repositories/
│   │   ├── contracts.ts
│   │   └── types.ts
│   └── ...
└── test/

tests/
└── performance/
```

**Structure Decision**: Use the existing single Next.js application layout under `src/`, keep `src/app` as the only route-entry layer, and refactor only the `issues` and `projects` feature UI into sub-domain folders. Feature-root domain layers remain stable, route files import explicit screen entries from sub-domain `screens/` folders, and tests/stories move with the owning file instead of being centralized.

**Story/Test Placement Rule**: `.stories.tsx`, `.test.tsx`, and browser-test artifacts are colocated with the owning screen or component instead of being centralized in a separate stories tree.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
