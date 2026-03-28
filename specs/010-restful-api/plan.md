# Implementation Plan: RESTful API Design

**Branch**: `010-restful-api` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-restful-api/spec.md`

## Summary

Convert existing Next.js server actions to RESTful API endpoints following industry standards. The API will provide predictable CRUD operations for projects, issues, and project members using appropriate HTTP methods, status codes, and URL structures. This transformation will enable standard HTTP client integration, improve API discoverability, and establish a foundation for future API consumers.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16.2.0 (App Router), Supabase (PostgreSQL), React 19.2.4
**Storage**: Supabase PostgreSQL
**Testing**: Vitest + Testing Library
**Target Platform**: Web (Node.js runtime)
**Project Type**: web-service
**Performance Goals**: API response under 200ms (p95), support 50+ concurrent users
**Constraints**: Must maintain backward compatibility with existing frontend, must reuse existing repositories and database schema
**Scale/Scope**: ~10 RESTful endpoints covering 3 domain entities (projects, issues, project members)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Project-First | ✅ PASS | API structure reflects project-first domain (`/projects/{id}/issues`) |
| II. Issue-Centric Design | ✅ PASS | Issue endpoints are comprehensive, nested under projects |
| III. Domain-Driven Design | ✅ PASS | Will reuse existing domain layer (contracts, types, lib, repositories) |
| IV. Incremental Completeness | ✅ PASS | User stories prioritized (P1-P4), each independently valuable |
| V. Test-Driven Development | ✅ PASS | API endpoints will have integration tests from day one |
| VI. Security & Data Integrity | ✅ PASS | Will reuse existing auth, enforce session-aware server clients |
| VII. Installable PWA | ✅ PASS | API serves PWA frontend, no impact on PWA capabilities |
| VIII. Simplicity (YAGNI) | ✅ PASS | Only RESTful endpoints, no over-engineering (no HATEOAS, no GraphQL) |

**Gate Result**: ✅ **PASS** - No violations. All principles satisfied.

### Post-Design Re-Check

*Completed after Phase 1 design - all artifacts reviewed*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Project-First | ✅ PASS | API structure `/projects/{id}/issues` enforces project-first domain |
| II. Issue-Centric Design | ✅ PASS | Issue endpoints include labels, comments, activity log for comprehensive issue management |
| III. Domain-Driven Design | ✅ PASS | Contracts define clear boundaries between domain entities; API layer uses existing repositories |
| IV. Incremental Completeness | ✅ PASS | P1 (CRUD) can ship independently; P2-P4 add filtering, pagination, advanced features |
| V. Test-Driven Development | ✅ PASS | Testing strategy defined with Vitest + fake clients; contract tests with Zod |
| VI. Security & Data Integrity | ✅ PASS | Optimistic locking via `version` field; auth checks documented for all endpoints |
| VII. Installable PWA | ✅ PASS | API design has no impact on PWA capabilities; serves existing PWA frontend |
| VIII. Simplicity (YAGNI) | ✅ PASS | No over-engineering: simple error format, standard pagination, no HATEOAS/Hypermedia |

**Gate Result**: ✅ **PASS** - No violations introduced during design. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/010-restful-api/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-endpoints.md
│   ├── error-responses.md
│   └── pagination-format.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── projects/
│   │   ├── contracts.ts        # Existing: reuse for API request/response types
│   │   ├── types.ts            # Existing: domain model
│   │   ├── lib/                # Existing: business logic
│   │   ├── repositories/       # Existing: data access
│   │   ├── actions/            # Existing: server actions (will coexist with API)
│   │   └── api/                # NEW: RESTful API route handlers
│   │       ├── projects.ts     # GET /api/v1/projects, POST /api/v1/projects
│   │       └── [id].ts         # GET/PATCH/DELETE /api/v1/projects/{id}
│   └── issues/
│       ├── contracts.ts        # Existing: reuse for API types
│       ├── types.ts            # Existing: domain model
│       ├── lib/                # Existing: business logic
│       ├── repositories/       # Existing: data access
│       ├── actions/            # Existing: server actions
│       └── api/                # NEW: RESTful API route handlers
│           └── [projectId]/
│               └── issues.ts   # GET/POST /api/v1/projects/{projectId}/issues
│               └── [issueId].ts # GET/PATCH/DELETE /api/v1/projects/{projectId}/issues/{issueId}
├── lib/
│   ├── api/                    # NEW: Shared API utilities
│   │   ├── error-handler.ts    # Consistent error response formatting
│   │   ├── validation.ts       # Request validation utilities
│   │   └── pagination.ts       # Pagination logic
│   └── supabase/
│       └── server-client.ts    # Existing: session-aware server client

tests/
├── api/                        # NEW: API integration tests
│   ├── projects.test.ts
│   └── issues.test.ts
└── contract/                   # NEW: API contract tests
    └── api-contracts.test.ts
```

**Structure Decision**: Following existing Next.js App Router structure with feature-based organization. API routes will be added as `route.ts` files in `app/api/v1/` directory to align with Next.js 13+ App Router conventions. Existing server actions (`actions/`) will coexist with API routes to maintain backward compatibility with the current frontend. Domain layer (`contracts`, `types`, `lib`, `repositories`) remains unchanged and is reused by both server actions and new API routes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section intentionally left empty.

---

## Phase 0: Research

**Status**: ✅ Complete

### Research Tasks

1. **Next.js App Router API Routes Best Practices**
   - Task: Research Next.js 13+ App Router route handler patterns for RESTful APIs
   - Questions: Route structure, error handling, request/response patterns, CORS configuration
   - Deliverable: Recommended approach for implementing RESTful endpoints in App Router

2. **API Versioning Strategies**
   - Task: Research API versioning approaches for URL-based versioning (`/api/v1/`)
   - Questions: How to structure versioned routes in Next.js, migration path for future versions
   - Deliverable: Versioning strategy and implementation approach

3. **Pagination Best Practices**
   - Task: Research cursor-based vs offset-based pagination for RESTful APIs
   - Questions: Trade-offs, when to use each approach, metadata format
   - Deliverable: Pagination strategy recommendation with rationale

4. **Error Response Standards**
   - Task: Research industry-standard error response formats (RFC 7807 Problem Details, JSON:API, etc.)
   - Questions: Which format to adopt, required fields, extensibility
   - Deliverable: Error response format specification

5. **OpenAPI/Swagger Integration with Next.js**
   - Task: Research tools for generating OpenAPI specs from Next.js route handlers
   - Questions: Available libraries, automatic type generation, documentation approach
   - Deliverable: Recommended tooling and integration approach

6. **Testing RESTful APIs in Next.js**
   - Question: What testing frameworks and patterns are used for Next.js API routes?
   - Best Practices: Integration testing, contract testing, authentication test setup
   - Deliverable: Testing strategy and setup recommendations

7. **Performance Patterns**
   - Question: What are the performance optimization patterns for Next.js API routes?
   - Best Practices: Caching, connection pooling, response optimization
   - Deliverable: Performance optimization guidelines

**Output**: ✅ [research.md](research.md) - All research completed with decisions documented

**Decisions Made**:
- Next.js App Router `route.ts` handlers for RESTful endpoints
- URL-based versioning (`/api/v1/`) with clear migration path
- Cursor-based pagination for issues, offset-based for projects
- Custom simple error format (inspired by RFC 7807)
- Manual OpenAPI spec with type generation
- Vitest + fake clients for testing

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### 1.1 Data Model

**Status**: ✅ Complete

**Output**: ✅ [data-model.md](data-model.md) - All entities defined (Project, Issue, ProjectMember, Label, Comment) with validation rules

### 1.2 API Contracts

**Status**: ✅ Complete

**Output**: ✅ `contracts/` directory with:
- ✅ [api-endpoints.md](contracts/api-endpoints.md) - 13 endpoints defined (Projects: 5, Issues: 5, Members: 3)
- ✅ [error-responses.md](contracts/error-responses.md) - 12 error codes with examples
- ✅ [pagination-format.md](contracts/pagination-format.md) - Both pagination strategies documented

### 1.3 Quickstart Guide

**Status**: ✅ Complete

**Output**: ✅ [quickstart.md](quickstart.md) - Developer guide with examples in cURL, JavaScript, and Python

### 1.4 Agent Context Update

**Status**: ✅ Complete

**Action**: ✅ Ran `.specify/scripts/bash/update-agent-context.sh claude` - Updated CLAUDE.md with TypeScript 5.x, Next.js 16.2.0, Supabase PostgreSQL

---

## Phase 2: Task Breakdown

**Status**: ⏳ Blocked by Phase 1

**Note**: Phase 2 is executed by `/speckit.tasks` command, NOT by `/speckit.plan`

**Output**: [tasks.md](tasks.md) - Dependency-ordered implementation tasks generated by `/speckit.tasks`

---

## Execution Notes

- This plan is generated by `/speckit.plan` command
- Phase 0 and Phase 1 are executed by this command
- Phase 2 requires `/speckit.tasks` command to generate implementation tasks
- Constitution Check will be re-evaluated after Phase 1 design is complete
