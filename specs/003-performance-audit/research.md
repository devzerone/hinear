# Research: Performance Investigation and Optimization

**Feature**: 003-performance-audit
**Date**: 2026-03-26
**Phase**: Phase 0 - Outline & Research

## Overview

This document consolidates research findings for implementing comprehensive performance investigation and optimization for the Hinear Next.js application. All technical decisions are documented with rationale and alternatives considered.

## 1. Performance Profiling Tools for Next.js App Router

### Decision: Multi-Layered Profiling Approach

**Selected Tools**:
1. **Next.js Built-in Performance Features** (Primary)
   - Static generation and server-side rendering metrics
   - Image optimization with `next/image`
   - Font optimization with `next/font`
   - Automatic code splitting

2. **Web Vitals** (User-Centric Metrics)
   - Core Web Vitals: LCP, FID, CLS
   - Custom metrics: TTFB, FCP, TTI
   - Integration: `next/web-vitals`

3. **React DevTools Profiler** (Development)
   - Component render times
   - Unnecessary re-render detection
   - Memoization opportunities

4. **@next/bundle-analyzer** (Build Time)
   - Bundle size analysis
   - Dependency identification
   - Code splitting opportunities

**Rationale**:
- Next.js built-in features are zero-overhead and framework-native
- Web Vitals align with industry standards and user experience
- React DevTools provides component-level insights without production impact
- Bundle analyzer prevents size regressions at build time

**Alternatives Considered**:
- **Lighthouse**: Good for one-time audits but not continuous monitoring
- **Chrome DevTools Performance Panel**: Powerful but manual, not automated
- **Third-party APM (DataDog, New Relic)**: Overkill for current scale, adds cost
- **Why Rejected**: Lighthouse is manual, DevTools requires manual operation, APMs are expensive and complex for current needs

**Implementation Notes**:
```typescript
// Web Vitals integration
import {CLS, FID, FCP, LCP, TTFB} from 'web-vitals';

// Bundle analyzer in next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

## 2. Database Query Analysis for Supabase/PostgreSQL

### Decision: Hybrid Query Monitoring Approach

**Selected Strategy**:
1. **Supabase Dashboard Query Performance**
   - Built-in query logging
   - Execution time tracking
   - Slow query identification

2. **Application-Level Query Tracking**
   - Custom middleware for query timing
   - Query execution logging in development
   - Performance metrics collection

3. **PostgreSQL EXPLAIN ANALYZE**
   - Query plan analysis
   - Index usage verification
   - Join optimization

**Rationale**:
- Supabase dashboard provides immediate visibility without setup
- Application-level tracking allows custom metrics and alerting
- EXPLAIN ANALYZE gives deep insights for problematic queries

**Alternatives Considered**:
- **pg_stat_statements**: Powerful but requires superuser access (not available on Supabase)
- **Third-party query monitors**: Add latency and cost
- **Why Rejected**: pg_stat_statements requires database extensions not available, third-party tools add overhead

**Implementation Notes**:
```typescript
// Query timing wrapper
async function trackQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    if (duration > 200) {
      console.warn(`Slow query: ${queryName} took ${duration}ms`);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`Query failed: ${queryName} after ${duration}ms`, error);
    throw error;
  }
}
```

**Optimization Strategies**:
- Add indexes on frequently queried columns (project_id, status, assignee_id)
- Use select() to limit columns retrieved
- Implement pagination for large result sets
- Cache frequently accessed data with React Query

## 3. Bundle Analysis and Code Splitting Strategies

### Decision: Route-Based Splitting + Dynamic Imports

**Selected Approach**:
1. **Route-Based Splitting** (Automatic in Next.js App Router)
   - Each route is automatically code-split
   - Only load code for current route

2. **Dynamic Imports for Heavy Components**
   - TipTap editor (rich text)
   - Charts/graphs
   - Modals and drawers

3. **Library Optimization**
   - Tree-shaking for large libraries
   - Consider lighter alternatives (e.g., date-fns vs. moment.js)
   - Module resolution optimization

**Rationale**:
- Next.js App Router has excellent built-in splitting
- Dynamic imports reduce initial bundle significantly
- Library optimization prevents bloating from dependencies

**Alternatives Considered**:
- **Micro-frontends**: Overkill for current app size, adds complexity
- **Lazy loading everything**: Hurts UX, makes interactions feel sluggish
- **Why Rejected**: Micro-frontends violate simplicity principle, lazy loading everything degrades UX

**Implementation Notes**:
```typescript
// Dynamic import for heavy components
const TipTapEditor = dynamic(() => import('./TipTapEditor'), {
  loading: () => <Skeleton />,
  ssr: false, // If not needed for SEO
});

// Bundle size target verification
// next.config.js
experimental: {
  optimizePackageImports: ['@tanstack/react-query', 'lucide-react'],
}
```

**Bundle Size Targets**:
- Initial bundle: <200KB (gzip)
- Each route chunk: <100KB (gzip)
- Total per page: <500KB (gzip)

## 4. React Performance Profiling in Production

### Decision: Sampling-Based Profiling with User Consent

**Selected Strategy**:
1. **React.Profiler with Sampling**
   - Profile 1-5% of user sessions
   - Aggregate data, no individual tracking
   - Production-safe with minimal overhead

2. **Custom Performance Marks**
   - Measure critical user interactions
   - Mark important operations
   - Use Performance Observer API

3. **Error Boundaries with Metrics**
   - Capture render errors
   - Log component stack traces
   - Track error rates

**Rationale**:
- Sampling minimizes performance impact while gathering data
- Performance Marks is standard browser API, zero overhead
- Error boundaries provide insight into crashes

**Alternatives Considered**:
- **Full profiling for all users**: Too much overhead, degrades UX
- **No production profiling**: Misses real-world performance issues
- **Why Rejected**: Full profiling violates performance goals, no profiling means flying blind

**Implementation Notes**:
```typescript
// Sampling-based profiling
const SHOULD_PROFILE = Math.random() < 0.01; // 1% sampling

<Profiler id="IssueDetail" onRender={(id, phase, actualDuration) => {
  if (SHOULD_PROFILE && actualDuration > 100) {
    recordSlowRender(id, phase, actualDuration);
  }
}}>
  <IssueDetailScreen />
</Profiler>

// Performance marks for critical paths
performance.mark('issue-load-start');
// ... load issue data ...
performance.mark('issue-load-end');
performance.measure('issue-load', 'issue-load-start', 'issue-load-end');
```

## 5. PWA Performance Monitoring

### Decision: Service Worker + Cache Metrics Integration

**Selected Approach**:
1. **Service Worker Performance API**
   - Cache hit/miss rates
   - Cache operation timing
   - Offline mode metrics

2. **Navigation Timing API**
   - Page load times
   - Resource loading times
   - Service worker activation time

3. **Network Information API**
   - Connection type (4G, 3G, etc.)
   - Effective bandwidth estimation
   - Context-aware performance thresholds

**Rationale**:
- Service Worker is already part of PWA architecture
- Navigation Timing is standard browser API
- Network Information helps understand performance context

**Alternatives Considered**:
- **Custom cache layer**: Reinventing the wheel, service worker already handles this
- **Ignoring PWA-specific metrics**: Misses critical PWA UX issues
- **Why Rejected**: Custom cache adds complexity, ignoring PWA metrics leaves blind spots

**Implementation Notes**:
```typescript
// Service worker message for metrics
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_METRICS') {
    recordCacheMetrics(event.data);
  }
});

// Cache strategy performance
const CACHE_STRATEGIES = {
  'stale-while-revalidate': measureCachePerformance('stale-while-revalidate'),
  'network-first': measureCachePerformance('network-first'),
  'cache-first': measureCachePerformance('cache-first'),
};
```

## 6. Performance Regression Detection

### Decision: CI/CD Integration + Baseline Comparison

**Selected Strategy**:
1. **Build-Time Bundle Size Checks**
   - Bundle size limits in next.config.js
   - CI fails if bundle exceeds threshold
   - Automated tracking of size changes

2. **Lighthouse CI**
   - Automated performance audits in CI
   - Performance budget enforcement
   - Regression detection

3. **Performance Baseline Tracking**
   - Store baseline metrics in database
   - Compare new builds against baseline
   - Alert on significant degradation (>20%)

**Rationale**:
- Build-time checks catch regressions before deployment
- Lighthouse CI is industry standard
- Baseline comparison provides trend analysis

**Alternatives Considered**:
- **Manual testing**: Too error-prone, not systematic
- **Production-only monitoring**: Too late, users already affected
- **Why Rejected**: Manual testing doesn't scale, production-only monitoring means users experience regressions

**Implementation Notes**:
```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse CI
  run: lhci autorun
  env:
    LHCI_BUILD_CONTEXT: ${{ github.event_name }}

# next.config.js
experimental: {
  optimizePackageImports: ['@tanstack/react-query', 'lucide-react'],
},
```

**Performance Budgets**:
```json
{
  "budgets": [
    {
      "path": "app/**/*.js",
      "maxSize": "200 kB",
      "gzip": true
    }
  ]
}
```

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| Profiling Tools | Next.js built-in + Web Vitals | Zero overhead, framework-native |
| Query Analysis | Dashboard + app-level tracking | Immediate visibility + custom metrics |
| Bundle Splitting | Route-based + dynamic imports | Automatic + targeted optimization |
| React Profiling | Sampling-based (1-5%) | Production-safe with minimal overhead |
| PWA Monitoring | Service Worker APIs | Leverages existing PWA architecture |
| Regression Detection | CI/CD + baseline comparison | Catch regressions before production |

## Technology Stack Additions

**New Dependencies** (if needed):
- `web-vitals`: Already included with Next.js
- `@next/bundle-analyzer`: Dev dependency for bundle analysis
- No production dependencies added (minimizes bundle size)

**Configuration Changes**:
- `next.config.js`: Add bundle analyzer, performance budgets
- `.github/workflows/`: Add Lighthouse CI workflow
- `tsconfig.json`: Add performance-related type definitions

## Next Steps

With research complete, proceed to Phase 1:
1. Create data-model.md with entity definitions
2. Define contracts in /contracts/ directory
3. Create quickstart.md with implementation guide
4. Update agent context with performance monitoring patterns
