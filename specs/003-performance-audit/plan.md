# Implementation Plan: Performance Investigation and Optimization

**Branch**: `003-performance-audit` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-performance-audit/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Investigate and resolve performance bottlenecks across the Hinear issue management application. The feature involves comprehensive performance profiling across all major user flows (project list, issue board, issue detail, issue creation), identification of bottlenecks in database queries, JavaScript bundles, API responses, and client-side rendering, followed by optimization of critical issues and establishment of ongoing performance monitoring.

Technical approach involves using browser DevTools, Next.js built-in performance monitoring, database query analysis, bundle analysis tools, and React profiling to identify issues, then applying targeted optimizations such as code splitting, query optimization, caching strategies, and component optimization.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16.2.0 (App Router), React 19.2.4, Supabase (PostgreSQL), @tanstack/react-query 5.95.2
**Storage**: Supabase PostgreSQL (already configured)
**Testing**: Vitest 4.1.0 + Testing Library, Playwright 1.58.2
**Target Platform**: Web (PWA) - Modern browsers (Chrome, Firefox, Safari, Edge from last 2 years)
**Project Type**: web-service (Next.js App Router with PWA capabilities)
**Performance Goals**: Page load under 2s, DB queries under 200ms, API responses under 100ms, initial bundle under 200KB (gzip)
**Constraints**: Must maintain PWA installability, offline support, and existing functionality during optimization
**Scale/Scope**: ~100 TypeScript/TSX files, domain-driven architecture with features/projects, features/issues, features/auth, features/comments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Compliance Assessment

**I. 프로젝트 우선 (Project-First)**: PASS - Performance work will respect project-scoped data access and permissions

**II. 이슈 중심 설계 (Issue-Centric Design)**: PASS - Optimizations will enhance issue detail screen performance as priority

**III. 도메인 주도 설계 (Domain-Driven Design)**: PASS - Performance monitoring will be implemented following existing feature structure (contracts, types, lib, repositories, actions, components)

**IV. 점진적 완성 (Incremental Completeness)**: PASS - Three prioritized user stories (P1: identify, P2: optimize, P3: monitor) align with incremental approach

**V. 테스트 주도 개발 (Test-Driven Development)**: PASS - Performance tests and benchmarks will be written alongside optimizations

**VI. 보안과 무결성 (Security & Data Integrity)**: PASS - Performance optimizations will not compromise RLS or security; session-aware clients will be maintained

**VII. 설치 가능한 PWA (Installable PWA)**: PASS - Optimizations must maintain PWA installability and service worker functionality

**VIII. 단순성 유지 (Simplicity)**: PASS - YAGNI principle will be followed; only necessary optimizations will be implemented

### Technical Standards Compliance

- **언어 및 프레임워크**: TypeScript 5.x, Next.js App Router ✅
- **아키텍처 원칙**: Server components first, server actions for mutations ✅
- **성능 기준**: Target 2s page load, 100ms interaction, 200KB initial bundle ✅

**PRE-PHASE 0 CONCLUSION**: All constitution gates passed. No violations to justify. Proceeded to Phase 0.

---

## Post-Phase 1 Design Re-check

### ✅ Constitution Compliance After Design

**I. 프로젝트 우선 (Project-First)**: ✅ PASS
- Data model includes `route` field for project-scoped metrics
- Performance tracking respects project boundaries
- No cross-project data aggregation without explicit scoping

**II. 이슈 중심 설계 (Issue-Centric Design)**: ✅ PASS
- Performance baselines defined for issue-related routes
- Issue detail screen optimization prioritized in quickstart
- Query tracking focuses on issue-related database operations

**III. 도메인 주도 설계 (Domain-Driven Design)**: ✅ PASS
- New `features/performance` follows established pattern:
  - `contracts/` - Profiling and monitoring contracts defined ✅
  - `types.ts` - Domain models in data-model.md ✅
  - `lib/` - Metric collector, profiler, analyzer utilities ✅
  - `repositories/` - Performance metrics repository ✅
  - `actions/` - Server actions for metric recording ✅
  - `components/` - Performance profiler and dashboard components ✅

**IV. 점진적 완성 (Incremental Completeness)**: ✅ PASS
- P1 (Profiling) can be deployed independently and delivers value
- P2 (Optimization) builds on P1 findings
- P3 (Monitoring) provides ongoing value after P1 and P2

**V. 테스트 주도 개발 (Test-Driven Development)**: ✅ PASS
- Unit tests defined for MetricCollector in quickstart
- Integration tests for performance API routes
- Performance regression tests included in monitoring strategy

**VI. 보안과 무결성 (Security & Data Integrity)**: ✅ PASS
- Sampling strategy (1-5%) minimizes performance impact
- No user-identifiable information collected
- RLS policies defined for performance tables
- Session-aware clients maintained for metric recording

**VII. 설치 가능한 PWA (Installable PWA)**: ✅ PASS
- PWA-specific performance monitoring included
- Service worker performance tracked
- Cache strategy performance monitored
- Bundle size limits ensure PWA remains installable

**VIII. 단순성 유지 (Simplicity)**: ✅ PASS
- No new production dependencies (only dev dependency: @next/bundle-analyzer)
- Uses built-in Next.js and browser APIs
- Leverages existing infrastructure (Supabase, React Query)
- Minimal complexity added for maximum value

### Design Quality Assessment

**Data Model**: ✅ Excellent
- Clear entities with well-defined relationships
- Follows Supabase/PostgreSQL best practices
- Proper indexing strategy defined
- Privacy and security considerations addressed

**Contracts**: ✅ Comprehensive
- Profiling contract covers all metric collection needs
- Monitoring contract provides baseline management and alerting
- Clear interfaces with TypeScript types
- Error handling and validation defined

**Quick Start**: ✅ Actionable
- Three-phase approach clearly documented
- Code examples provided for all major features
- Common issues and fixes included
- Testing strategy defined

**POST-PHASE 1 CONCLUSION**: Design maintains full constitution compliance. Ready for task generation phase.

## Project Structure

### Documentation (this feature)

```text
specs/003-performance-audit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── performance/                 # NEW FEATURE
│   │   ├── contracts.ts             # Performance metric types, monitoring contracts
│   │   ├── types.ts                 # Performance domain models
│   │   ├── lib/                     # Performance measurement utilities
│   │   │   ├── profiler.ts          # Core profiling logic
│   │   │   ├── metric-collector.ts  # Metric collection utilities
│   │   │   └── analyzer.ts          # Performance analysis logic
│   │   ├── repositories/            # Data access for performance metrics
│   │   │   └── performance-metrics-repository.ts
│   │   ├── actions/                 # Server actions for performance data
│   │   │   ├── record-metrics-action.ts
│   │   │   └── get-performance-report-action.ts
│   │   ├── components/              # Performance monitoring UI components
│   │   │   ├── PerformanceProfiler.tsx
│   │   │   └── MetricsDashboard.tsx
│   │   └── hooks/                   # Performance measurement hooks
│   │       ├── usePerformanceProfiler.ts
│   │       └── useMetricsRecorder.ts
│   ├── projects/                    # EXISTING - may need optimization
│   ├── issues/                      # EXISTING - may need optimization
│   └── auth/                        # EXISTING - may need optimization
├── lib/
│   └── performance/                 # SHARED utilities
│       ├── bundle-analyzer.ts       # Bundle analysis utilities
│       ├── query-tracker.ts         # Database query tracking
│       └── react-devtools.ts        # React profiling integration
├── app/
│   └── api/
│       └── performance/             # Performance API routes
│           ├── metrics/route.ts
│           └── report/route.ts
└── middleware.ts                    # MAY NEED UPDATE - performance headers

tests/
├── performance/                     # NEW - performance tests
│   ├── profiling.test.ts
│   ├── bundle-size.test.ts
│   └── query-performance.test.ts
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Following the established domain-driven architecture pattern. New `features/performance` directory will contain all performance-related functionality following the same contracts → types → lib → repositories → actions → components structure used by other features (projects, issues, auth). Shared utilities in `lib/performance` will be used across features for profiling and monitoring.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations to justify. All constitution gates passed without requiring additional complexity.

---

## Phase 0: Outline & Research

### Research Tasks

Based on Technical Context, the following areas need research:

1. **Performance Profiling Tools for Next.js App Router**
   - Task: Research available tools for profiling Next.js 16 App Router applications
   - Focus: Built-in Next.js metrics, third-party monitoring solutions, React DevTools integration
   - Output: Recommended toolset for comprehensive profiling

2. **Database Query Analysis for Supabase/PostgreSQL**
   - Task: Research best practices for analyzing and optimizing Supabase query performance
   - Focus: Query logging, execution plan analysis, indexing strategies, connection pooling
   - Output: Query profiling approach and optimization patterns

3. **Bundle Analysis and Code Splitting Strategies**
   - Task: Research bundle analysis tools and code splitting patterns for Next.js 16
   - Focus: @next/bundle-analyzer, dynamic imports, route-based splitting, library optimization
   - Output: Bundle optimization recommendations

4. **React Performance Profiling in Production**
   - Task: Research safe React performance monitoring for production environments
   - Focus: React.Profiler usage, profiling overhead, production-safe metrics collection
   - Output: Production profiling strategy

5. **PWA Performance Monitoring**
   - Task: Research PWA-specific performance monitoring approaches
   - Focus: Service worker performance, cache strategies, offline mode metrics
   - Output: PWA performance monitoring approach

6. **Performance Regression Detection**
   - Task: Research automated performance regression detection systems
   - Focus: CI/CD integration, baseline comparison, alerting thresholds
   - Output: Monitoring and alerting strategy

### Research Execution

Research will be conducted by examining:
- Next.js 16 documentation for built-in performance features
- Supabase documentation for query optimization
- React documentation for production profiling
- Web Vitals documentation for user-centric metrics
- Community best practices for PWA performance

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete with all decisions made

### Data Model Design

Extract entities from feature spec → `data-model.md`:

**Entities to define**:
- PerformanceMetric: Load time, response time, memory usage, bundle size
- PerformanceBottleneck: Issue with severity rating and impact assessment
- PerformanceBaseline: Target values for different functions
- OptimizationRecord: Before/after metrics and implementation details

**Relationships**:
- PerformanceBottleneck references PerformanceMetric
- OptimizationRecord references PerformanceBottleneck
- PerformanceBaseline references PerformanceMetric

### Contract Definitions

Define interfaces in `/contracts/`:

1. **Performance Profiling Contract**
   - Metric collection interface
   - Profiling session management
   - Report generation format

2. **Monitoring Contract**
   - Metric submission API
   - Alert triggering conditions
   - Baseline comparison logic

3. **Optimization Contract**
   - Bottleneck identification format
   - Optimization recommendation structure
   - Before/after measurement protocol

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` to update Claude's context with new performance-related technologies and patterns.

---

## Phase 2: Task Generation

**Note**: This phase is executed by `/speckit.tasks`, NOT by `/speckit.plan`

The `tasks.md` file will be generated based on:
- User stories from spec.md (P1, P2, P3 priorities)
- Design artifacts from data-model.md and contracts/
- Research findings from research.md
- Quick start guide from quickstart.md

Tasks will be organized by:
1. Setup and infrastructure
2. Phase 1: Performance profiling (P1)
3. Phase 2: Critical optimizations (P2)
4. Phase 3: Monitoring setup (P3)
5. Documentation and cleanup
