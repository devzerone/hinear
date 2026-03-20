# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hinear is a project-first issue management app built with Next.js App Router, Supabase for data/auth, and PWA capabilities. The top-level domain boundary is `project` (not workspace), with each project being either `personal` or `team`. Issues use project-scoped identifiers like `PROJECTKEY-n` (e.g., `WEB-1`).

## Development Commands

```bash
pnpm dev              # Start development server
pnpm lint             # Run Biome linter
pnpm lint:fix         # Auto-fix lint issues
pnpm typecheck        # Run TypeScript type checking
pnpm test             # Run Vitest tests
pnpm test:watch       # Run tests in watch mode
pnpm build            # Build for production
```

## Critical Architecture Notes

### Current Security Warning
The repository implementations (`SupabaseProjectsRepository`, `SupabaseIssuesRepository`) currently default to `service-role` client for rapid development. This **bypasses RLS** and must be replaced with session-aware server clients before production use. Server actions temporarily use `HINEAR_ACTOR_ID` env var as actor fallback.

### Feature Structure
Each domain feature follows this pattern:
- `contracts.ts` - Input/output types
- `types.ts` - Domain model types
- `lib/` - Pure business logic
- `repositories/` - Data access layer (Supabase implementations)
- `actions/` - Next.js server actions
- `components/` - React components

### Domain Model
- **Project**: Top-level boundary, `personal` or `team`
- **Issue**: Belongs to exactly one project, defaults to `Triage` status
- **ProjectMember**: Access control with `owner`/`member` roles
- Issue statuses: `Triage` → `Backlog`/`Todo` → `In Progress` → `Done`

### Current App Flow
`/projects/new` → `/projects/[projectId]` → `/projects/[projectId]/issues/[issueId]`

### Environment Setup
Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HINEAR_ACTOR_ID` (temporary, to be removed)

## Key Documentation

- `docs/issue-detail/overview.md` - Feature scope and requirements
- `docs/issue-detail/roadmap.md` - MVP stages and priorities
- `docs/issue-detail/optimistic-locking.md` - Concurrent edit conflict resolution (MVP 2)
- `docs/todo.md` - Current session context and next priorities
- `docs/session-handoff.md` - Implementation status and next steps

## Next Priority Tasks

1. Replace service-role-first repository usage with session-aware server wiring
2. Remove `HINEAR_ACTOR_ID` temporary actor fallback
3. Implement optimistic locking for concurrent edits (MVP 2)
4. Complete issue detail editing controls

## Design System

UI design is based on `pen/Hinear.pen` file created with Pen design tool. This file contains Issue Create Page, Sidebar, and overall layout structure. Extract design tokens (colors, fonts, spacing, component structure) from this file when implementing React components. See `docs/issue-detail/overview.md` and `specs/issue-detail.md` for design integration details.
