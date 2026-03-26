# Tasks: Performance Investigation and Optimization

**Input**: Design documents from `/specs/003-performance-audit/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are included for core performance utilities and API routes as defined in the constitution (TDD approach)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js App Router application with domain-driven architecture:
- Feature code: `src/features/performance/`
- Shared utilities: `src/lib/performance/`
- API routes: `src/app/api/performance/`
- Tests: `tests/performance/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install @next/bundle-analyzer dev dependency with pnpm add -D @next/bundle-analyzer
- [ ] T002 Create performance feature directory structure: src/features/performance/{lib,repositories,actions,components,hooks}
- [ ] T003 [P] Create shared utilities directory: src/lib/performance/
- [ ] T004 [P] Create performance tests directory: tests/performance/
- [ ] T005 Update next.config.js with bundle analyzer configuration per quickstart.md
- [ ] T006 [P] Update biome.json to ignore specs directory from linting (already done in main merge)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [ ] T007 Create Supabase migration file: mcp/hinear/migrations/003_performance_tables.sql
- [ ] T008 Define performance_metrics table with indexes (id, name, value, unit, timestamp, route, environment, metadata)
- [ ] T009 Define performance_bottlenecks table with constraints (category, severity, status transitions)
- [ ] T010 Define performance_baselines table with threshold validation
- [ ] T011 Define optimization_records table with improvement tracking
- [ ] T012 Add RLS policies for performance tables (read: authenticated, write: system processes only)
- [ ] T013 Run migration in Supabase to create performance tables

### Type System & Contracts

- [ ] T014 [P] Create contracts.ts in src/features/performance/ with MetricCategory, MetricUnit, BottleneckCategory, BottleneckSeverity, BottleneckStatus enums
- [ ] T015 [P] Create types.ts in src/features/performance/ with PerformanceMetric, PerformanceBottleneck, PerformanceBaseline, OptimizationRecord interfaces
- [ ] T016 [P] Create ProfilingSession, WebVitals, BundleAnalysis, QueryAnalysis, PerformanceReport types in contracts.ts
- [ ] T017 [P] Create BaselineViolation, Alert, PerformanceRegression types in contracts.ts
- [ ] T018 [P] Create MetricCollector, ProfilingContext, BaselineManager, BottleneckTracker, AlertManager interfaces in contracts.ts

### Core Utilities

- [ ] T019 [P] Implement MetricCollector class in src/features/performance/lib/metric-collector.ts with mark(), measure(), recordMetric(), getMetrics() methods
- [ ] T020 [P] Implement query tracker wrapper in src/lib/performance/query-tracker.ts with trackQuery<T>() function
- [ ] T021 [P] Implement performance profiler hook in src/features/performance/hooks/usePerformanceProfiler.ts with 1% sampling
- [ ] T022 [P] Implement metrics recorder hook in src/features/performance/hooks/useMetricsRecorder.ts

### Repository Layer

- [ ] T023 Create PerformanceMetricsRepository in src/features/performance/repositories/performance-metrics-repository.ts
- [ ] T024 Implement saveMetric() method in PerformanceMetricsRepository
- [ ] T025 Implement getMetricsByTimeRange() method in PerformanceMetricsRepository
- [ ] T026 Implement getMetricsByRoute() method in PerformanceMetricsRepository
- [ ] T027 Implement saveBottleneck() method in PerformanceMetricsRepository
- [ ] T028 Implement getBottlenecksByStatus() method in PerformanceMetricsRepository
- [ ] T029 Implement saveBaseline() method in PerformanceMetricsRepository
- [ ] T030 Implement getBaselines() method in PerformanceMetricsRepository
- [ ] T031 Implement checkBaselineViolations() method in PerformanceMetricsRepository

### Server Actions

- [ ] T032 Create recordMetric action in src/features/performance/actions/record-metric-action.ts
- [ ] T033 Create getPerformanceReport action in src/features/performance/actions/get-performance-report-action.ts
- [ ] T034 Create setBaseline action in src/features/performance/actions/set-baseline-action.ts
- [ ] T035 Create identifyBottlenecks action in src/features/performance/actions/identify-bottlenecks-action.ts

### API Routes

- [ ] T036 Create POST /api/performance/metrics route in src/app/api/performance/metrics/route.ts
- [ ] T037 Create GET /api/performance/report route in src/app/api/performance/report/route.ts
- [ ] T038 Create POST /api/performance/baselines route in src/app/api/performance/baselines/route.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Identify Performance Bottlenecks (Priority: P1) 🎯 MVP

**Goal**: Implement comprehensive performance profiling across all major user flows to identify bottlenecks

**Independent Test**: Run profiling tools across project list, issue board, issue detail, issue creation flows and verify a detailed report is generated with categorized bottlenecks (Critical/High/Medium/Low)

### Tests for User Story 1

- [ ] T039 [P] [US1] Unit test for MetricCollector in tests/performance/metric-collector.test.ts (test mark(), measure(), recordMetric())
- [ ] T040 [P] [US1] Unit test for query tracker in tests/performance/query-tracker.test.ts (test trackQuery() with slow query detection)
- [ ] T041 [P] [US1] Integration test for metrics API in tests/performance/api/metrics.test.ts (test POST /api/performance/metrics)
- [ ] T042 [P] [US1] Integration test for report API in tests/performance/api/report.test.ts (test GET /api/performance/report)

### Implementation for User Story 1

#### Web Vitals Collection

- [ ] T043 [P] [US1] Create WebVitals component in src/components/WebVitals.tsx
- [ ] T044 [P] [US1] Implement CLS, FID, FCP, LCP, TTFB collection in WebVitals component
- [ ] T045 [P] [US1] Add reportWebVital() function to send metrics to /api/performance/metrics
- [ ] T046 [US1] Integrate WebVitals component in src/app/layout.tsx (update existing root layout)

#### Performance Profiling

- [ ] T047 [US1] Add usePerformanceProfiler hook to project list page in src/app/projects/[projectId]/page.tsx
- [ ] T048 [US1] Add usePerformanceProfiler hook to issue board components
- [ ] T049 [US1] Add usePerformanceProfiler hook to issue detail page in src/app/projects/[projectId]/issues/[issueId]/page.tsx
- [ ] T050 [US1] Add usePerformanceProfiler hook to issue creation page in src/app/projects/[projectId]/issues/new/page.tsx

#### Database Query Analysis

- [ ] T051 [P] [US1] Wrap getProject() repository call with trackQuery() in src/features/projects/repositories/server-projects-repository.ts
- [ ] T052 [P] [US1] Wrap getIssues() repository call with trackQuery() in src/features/issues/repositories/server-issues-repository.ts
- [ ] T053 [P] [US1] Wrap getIssue() repository call with trackQuery() in src/features/issues/repositories/server-issues-repository.ts
- [ ] T054 [P] [US1] Wrap createIssue() repository call with trackQuery() in src/features/issues/repositories/server-issues-repository.ts
- [ ] T055 [P] [US1] Wrap updateIssue() repository call with trackQuery() in src/features/issues/repositories/server-issues-repository.ts

#### Bundle Analysis Setup

- [ ] T056 [US1] Configure webpack performance budgets in next.config.js (maxAssetSize: 200KB, maxEntrypointSize: 200KB)
- [ ] T057 [US1] Add package import optimization in next.config.js (optimizePackageImports: ['@tanstack/react-query', 'lucide-react'])
- [ ] T058 [US1] Create bundle analyzer script in package.json: "analyze": "ANALYZE=true pnpm build"
- [ ] T059 [US1] Run bundle analysis and generate baseline report

#### Bottleneck Identification

- [ ] T060 [US1] Implement analyzeMetrics() function in src/features/performance/lib/analyzer.ts
- [ ] T061 [US1] Implement categorizeBottleneck() function with severity calculation (CRITICAL: >5x, HIGH: 3-5x, MEDIUM: 2-3x, LOW: 1-2x)
- [ ] T062 [US1] Implement generatePerformanceReport() function in src/features/performance/lib/analyzer.ts
- [ ] T063 [US1] Create PerformanceProfiler component in src/features/performance/components/PerformanceProfiler.tsx
- [ ] T064 [US1] Create MetricsDashboard component in src/features/performance/components/MetricsDashboard.tsx

#### Performance Report Generation

- [ ] T065 [US1] Implement generatePerformanceReport action in src/features/performance/actions/generate-performance-report-action.ts
- [ ] T066 [US1] Add report aggregation logic (totalMetrics, averagePageLoadTime, slowQueriesCount, averageBundleSize, webVitals)
- [ ] T067 [US1] Add bottleneck categorization by severity and user experience impact
- [ ] T068 [US1] Implement report export functionality (JSON format for analysis)

**Checkpoint**: At this point, User Story 1 should be fully functional - profiling tools identify bottlenecks with severity ratings

---

## Phase 4: User Story 2 - Optimize Critical Performance Issues (Priority: P2)

**Goal**: Implement fixes for the most critical performance issues identified in User Story 1

**Independent Test**: Measure before/after performance metrics on critical bottlenecks and verify page load times improve by at least 50%, slowest queries execute in under 200ms, and initial JavaScript payload reduces by at least 30%

### Tests for User Story 2

- [ ] T069 [P] [US2] Performance regression test in tests/performance/regression.test.ts (verify no degradation from optimizations)
- [ ] T070 [P] [US2] Bundle size test in tests/performance/bundle-size.test.ts (verify bundle <200KB target)
- [ ] T071 [P] [US2] Query performance test in tests/performance/query-performance.test.ts (verify queries <200ms target)

### Implementation for User Story 2

#### Database Query Optimization

- [ ] T072 [P] [US2] Create Supabase migration for indexes: mcp/hinear/migrations/003_query_indexes.sql
- [ ] T073 [P] [US2] Add index on issues(project_id, status) for project list queries
- [ ] T074 [P] [US2] Add index on issues(assignee_id) for assignee filter queries
- [ ] T075 [P] [US2] Add index on issues(created_at DESC) for chronological ordering
- [ ] T076 [US2] Run EXPLAIN ANALYZE on slow queries identified in US1
- [ ] T077 [US2] Optimize queries by selecting only needed columns (use select() instead of select('*'))
- [ ] T078 [US2] Implement pagination for large result sets in issue list queries
- [ ] T079 [US2] Add React Query caching with staleTime: 5*60*1000 (5 minutes) for project data
- [ ] T080 [US2] Add React Query caching for issue data with cacheTime: 10*60*1000 (10 minutes)

#### Bundle Size Optimization

- [ ] T081 [P] [US2] Identify large dependencies via bundle analyzer report from US1
- [ ] T082 [P] [US2] Implement dynamic import for TipTap editor in src/features/issues/components/tiptap-editor/
- [ ] T083 [P] [US2] Implement dynamic import for charts/graphs components (if any)
- [ ] T084 [P] [US2] Implement dynamic import for modals and drawers
- [ ] T085 [US2] Add loading skeletons for all dynamic imports
- [ ] T086 [US2] Configure ssr: false for client-only heavy components
- [ ] T087 [US2] Verify tree-shaking is working for large libraries (@tanstack/react-query, lucide-react)

#### Code Splitting Implementation

- [ ] T088 [P] [US2] Split issue detail page into route-based chunks
- [ ] T089 [P] [US2] Split project settings page into route-based chunks
- [ ] T090 [US2] Implement lazy loading for below-the-fold content
- [ ] T091 [US2] Add preload hints for critical resources
- [ ] T092 [US2] Optimize image loading with next/image for all images
- [ ] T093 [US2] Configure next/font for automatic font optimization

#### React Component Optimization

- [ ] T094 [P] [US2] Identify components with excessive re-renders from US1 profiling
- [ ] T095 [P] [US2] Add React.memo to expensive pure components
- [ ] T096 [P] [US2] Implement useMemo for expensive computations
- [ ] T097 [P] [US2] Implement useCallback for event handlers passed to child components
- [ ] T098 [US2] Split large components into smaller, more focused components
- [ ] T099 [US2] Optimize list rendering with virtualization for long lists (if applicable)

#### Optimization Tracking

- [ ] T100 [US2] Implement recordOptimization() in src/features/performance/actions/record-optimization-action.ts
- [ ] T101 [US2] Capture before/after metrics for each optimization
- [ ] T102 [US2] Calculate improvementPercentage for each optimization
- [ ] T103 [US2] Store optimization records in optimization_records table
- [ ] T104 [US2] Update bottleneck status from IDENTIFIED → IN_PROGRESS → RESOLVED
- [ ] T105 [US2] Generate optimization summary report showing improvements

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - optimizations show measurable improvements

---

## Phase 5: User Story 3 - Establish Performance Monitoring (Priority: P3)

**Goal**: Implement ongoing performance monitoring to catch regressions early and maintain performance standards

**Independent Test**: Set up monitoring tools and verify they capture performance metrics, send alerts when performance degrades below thresholds, and detect regressions within 24 hours of deployment

### Tests for User Story 3

- [ ] T106 [P] [US3] Unit test for BaselineManager in tests/performance/baseline-manager.test.ts
- [ ] T107 [P] [US3] Unit test for BottleneckTracker in tests/performance/bottleneck-tracker.test.ts
- [ ] T108 [P] [US3] Unit test for AlertManager in tests/performance/alert-manager.test.ts
- [ ] T109 [P] [US3] Integration test for alerting in tests/performance/alerting.test.ts (test violation detection and alert sending)

### Implementation for User Story 3

#### Baseline Management

- [ ] T110 [P] [US3] Create BaselineManager in src/features/performance/lib/baseline-manager.ts
- [ ] T111 [P] [US3] Implement getBaseline() method with route-specific fallback
- [ ] T112 [P] [US3] Implement setBaseline() method with validation
- [ ] T113 [P] [US3] Implement checkBaselines() method to compare metrics against thresholds
- [ ] T114 [P] [US3] Implement deleteBaseline() method
- [ ] T115 [P] [US3] Implement getAllBaselines() method
- [ ] T116 [US3] Initialize default baselines in database (page_load_time: 2000ms, query_duration: 200ms, bundle_size: 200KB)

#### Bottleneck Tracking

- [ ] T117 [P] [US3] Create BottleneckTracker in src/features/performance/lib/bottleneck-tracker.ts
- [ ] T118 [P] [US3] Implement identifyBottlenecks() method comparing metrics to baselines
- [ ] T119 [P] [US3] Implement updateStatus() method for bottleneck lifecycle
- [ ] T120 [P] [US3] Implement getBottlenecks() method with filtering (category, severity, status)
- [ ] T121 [P] [US3] Implement getBottleneck() method by ID
- [ ] T122 [P] [US3] Implement recordOptimization() method linking to bottleneck

#### Alerting System

- [ ] T123 [P] [US3] Create AlertManager in src/features/performance/lib/alert-manager.ts
- [ ] T124 [P] [US3] Implement checkAlerts() method for violation and bottleneck conditions
- [ ] T125 [P] [US3] Implement sendAlert() method with severity-based routing
- [ ] T126 [P] [US3] Implement getAlertHistory() method for time-range queries
- [ ] T127 [P] [US3] Implement alert deduplication (prevent spam, rate limit non-critical alerts)
- [ ] T128 [US3] Add alert formatting for different channels (console, email placeholder, webhook placeholder)

#### Performance Regression Detection

- [ ] T129 [US3] Implement detectRegression() in src/features/performance/lib/regression-detector.ts
- [ ] T130 [US3] Compare current metrics to historical baseline (20% degradation threshold)
- [ ] T131 [US3] Implement metric aggregation by name and route
- [ ] T132 [US3] Implement trend analysis (improving, stable, degrading)
- [ ] T133 [US3] Add regression detection to CI/CD workflow (placeholder in .github/workflows/performance.yml)

#### Monitoring Dashboard

- [ ] T134 [P] [US3] Create admin performance dashboard in src/app/admin/performance/page.tsx
- [ ] T135 [P] [US3] Add real-time metrics display to dashboard
- [ ] T136 [P] [US3] Add bottleneck list with severity indicators to dashboard
- [ ] T137 [P] [US3] Add baseline configuration UI to dashboard
- [ ] T138 [P] [US3] Add optimization history view to dashboard
- [ ] T139 [P] [US3] Add alert history view to dashboard
- [ ] T140 [US3] Implement performance trend charts (placeholder for chart library integration)

#### Automated Monitoring

- [ ] T141 [US3] Create background job to check baselines every hour
- [ ] T142 [US3] Implement alert triggering on critical threshold violations
- [ ] T143 [US3] Add sampling-based metric collection (1-5% of sessions)
- [ ] T144 [US3] Implement metric aggregation for time-series queries
- [ ] T145 [US3] Add data retention policy enforcement (30 days raw, 1 year aggregated)
- [ ] T146 [US3] Implement PWA-specific monitoring (service worker cache metrics, offline mode metrics)

**Checkpoint**: All user stories should now be independently functional - monitoring system tracks performance 24/7

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T147 [P] Document all performance optimizations in docs/performance-optimizations.md
- [ ] T148 [P] Create runbook for common performance issues in docs/performance-runbook.md
- [ ] T149 [P] Add performance monitoring guide to CLAUDE.md
- [ ] T150 [P] Update quickstart.md with any implementation learnings
- [ ] T151 [P] Code cleanup: remove any TODO comments or temporary console.log statements
- [ ] T152 [P] Add TypeScript strict type checking for performance feature
- [ ] T153 [P] Run Biome linter and fix any issues in performance code
- [ ] T154 [P] Verify all performance tests pass: pnpm test tests/performance
- [ ] T155 [P] Run TypeScript type checking: pnpm typecheck
- [ ] T156 Validate quickstart.md checklist items are complete
- [ ] T157 Run bundle analysis one final time: ANALYZE=true pnpm build
- [ ] T158 Verify bundle size targets are met (<200KB initial, <100KB per route chunk)
- [ ] T159 Run Lighthouse CI and verify performance budgets pass
- [ ] T160 Document any remaining performance debt for future iterations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - NO dependencies on other user stories
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion + User Story 1 (needs profiling data from US1)
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion - NO dependencies on other user stories (can run in parallel with US2)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Profiling)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅
- **User Story 2 (P2 - Optimization)**: Depends on User Story 1 (needs bottleneck identification data) - Should wait for US1 completion
- **User Story 3 (P3 - Monitoring)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ (can run in parallel with US2)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach per constitution)
- Types and contracts before implementations
- Repository layer before actions
- Actions before API routes
- Core implementation before UI components
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004 can run in parallel (directory creation)
- T005, T006 can run in parallel (configuration updates)

**Foundational Phase (Phase 2)**:
- T007-T012 (database schema) can run in sequence
- T014-T017 (types and contracts) can all run in parallel
- T019-T021 (core utilities) can run in parallel
- T032-T038 (actions and API routes) can run in parallel after repositories complete

**User Story 1 (Phase 3)**:
- T039-T042 (all tests) can run in parallel
- T043-T046 (Web Vitals) can run in parallel
- T051-T055 (query tracking) can all run in parallel
- T047-T050 (profiling hooks) can run in parallel
- T082-T087 (bundle optimization) can run in parallel
- T094-T099 (component optimization) can run in parallel

**User Story 3 (Phase 5)**:
- T106-T109 (all tests) can run in parallel
- T110-T116 (BaselineManager) can run in parallel
- T117-T122 (BottleneckTracker) can run in parallel
- T123-T128 (AlertManager) can run in parallel
- T134-T140 (dashboard components) can run in parallel

**Cross-Story Parallelization**:
- After Foundational (Phase 2) completes, US3 can start immediately (doesn't depend on US1)
- US1 and US3 can be developed in parallel by different team members
- US2 must wait for US1 to complete (needs profiling data)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T039: "Unit test for MetricCollector"
Task T040: "Unit test for query tracker"
Task T041: "Integration test for metrics API"
Task T042: "Integration test for report API"

# Launch all query tracking optimizations together:
Task T051: "Wrap getProject() with trackQuery()"
Task T052: "Wrap getIssues() with trackQuery()"
Task T053: "Wrap getIssue() with trackQuery()"
Task T054: "Wrap createIssue() with trackQuery()"
Task T055: "Wrap updateIssue() with trackQuery()"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T038) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T039-T068)
4. **STOP and VALIDATE**: Run profiling tools, verify bottleneck identification works
5. Generate initial performance report, document findings
6. Deploy/demo profiling capability

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready for all performance work
2. Add User Story 1 (Profiling) → Test independently → Deploy/Demo (MVP - identifies bottlenecks!)
3. Add User Story 2 (Optimization) → Test independently → Deploy/Demo (fixes critical issues!)
4. Add User Story 3 (Monitoring) → Test independently → Deploy/Demo (ongoing visibility!)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T038)
2. Once Foundational (Phase 2) is done:
   - Developer A: User Story 1 (Profiling) - T039-T068
   - Developer B: User Story 3 (Monitoring) - T106-T146 (can start in parallel!)
3. After User Story 1 completes:
   - Developer A: User Story 2 (Optimization) - T069-T105
   - Developer B: Continue User Story 3 or help with US2
4. Stories integrate and deploy independently

### Recommended Execution Order

**Week 1-2: Foundation**
- Focus on completing Phase 1 (Setup) and Phase 2 (Foundational)
- This unblocks all user story work

**Week 3-4: Profiling (User Story 1)**
- Complete Phase 3 to identify all bottlenecks
- Generate comprehensive performance report
- This provides the data needed for optimization

**Week 5-6: Optimization (User Story 2)**
- Use profiling data from US1 to prioritize fixes
- Focus on high-impact, low-hanging fruit
- Measure and document improvements

**Week 7-8: Monitoring (User Story 3)**
- Set up ongoing performance tracking
- Configure alerting
- Prevent future regressions

**Week 9: Polish**
- Complete Phase 6 tasks
- Documentation and cleanup
- Final validation and deployment

---

## Notes

- **[P]** tasks = different files, no dependencies on incomplete tasks
- **[Story]** label maps task to specific user story for traceability
- Each user story is independently completable and testable
- TDD approach: Write tests first, verify they fail, then implement
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently
- Performance goals: Page load <2s, Queries <200ms, Bundle <200KB, API response <100ms
- Sampling rate: 1-5% of sessions for production profiling
- Data retention: 30 days raw metrics, 1 year aggregated
- Remember: US2 depends on US1 (needs profiling data), but US3 is independent

---

## Task Summary

- **Total Tasks**: 160
- **Setup Phase**: 6 tasks (T001-T006)
- **Foundational Phase**: 32 tasks (T007-T038)
- **User Story 1 (Profiling)**: 30 tasks (T039-T068)
- **User Story 2 (Optimization)**: 37 tasks (T069-T105)
- **User Story 3 (Monitoring)**: 41 tasks (T106-T146)
- **Polish Phase**: 14 tasks (T147-T160)

**Parallel Opportunities**: 80+ tasks marked with [P] can be executed in parallel with appropriate team size

**Independent Test Criteria**:
- US1: Run profiling tools and verify detailed bottleneck report with severity ratings
- US2: Measure before/after metrics showing 50%+ improvement in page load, 30%+ reduction in bundle size
- US3: Set up monitoring and verify alerts trigger within 1 hour of regression

**Suggested MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1 - Profiling) = 68 tasks for initial deployment

**Format Validation**: ✅ All tasks follow required checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
