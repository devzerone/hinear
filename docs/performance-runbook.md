# Performance Runbook

## Overview

This runbook provides step-by-step procedures for diagnosing and resolving common performance issues in the Hinear application.

## Quick Diagnosis

### Check List

1. **Is the issue affecting all users or specific ones?**
   - All users → Backend/database issue
   - Specific users → Client-side or user-specific data issue

2. **When did the issue start?**
   - After recent deployment → Regression from new code
   - Gradual degradation → Resource exhaustion or data growth
   - Sudden spike → External dependency or traffic spike

3. **What are the symptoms?**
   - Slow page loads → Bundle size, network, or database queries
   - Slow interactions → JavaScript execution or re-renders
   - Memory leaks → Client-side state management
   - Database timeouts → Missing indexes or inefficient queries

## Common Issues & Solutions

### Issue: Slow Page Load Times (>3 seconds)

#### Diagnosis Steps

1. **Check Web Vitals**
   ```bash
   # Query performance_metrics table
   SELECT name, AVG(value) as avg_value, unit
   FROM performance_metrics
   WHERE name IN ('page_load_time', 'first_contentful_paint', 'largest_contentful_paint')
   AND timestamp > NOW() - INTERVAL '24 hours'
   GROUP BY name, unit;
   ```

2. **Check Bundle Size**
   ```bash
   # Run bundle analyzer
   ANALYZE=true pnpm build
   ```

3. **Check Database Queries**
   ```bash
   # Run query performance report
   pnpm test tests/performance/query-performance.test.ts
   ```

#### Solutions

**Bundle Size Too Large**
- Apply dynamic imports to heavy components
- Remove unused dependencies
- Enable tree-shaking for large libraries

**Database Queries Slow**
- Add indexes for slow queries (see `supabase/migrations/004_query_indexes.sql`)
- Use `select()` with specific columns instead of `select(*)`
- Implement pagination for large result sets

**Network Latency**
- Enable CDN for static assets
- Optimize images with `next/image`
- Implement service worker caching

### Issue: High Memory Usage

#### Diagnosis Steps

1. **Check Browser DevTools**
   - Open Memory tab
   - Take heap snapshot
   - Look for detached DOM nodes or large object arrays

2. **Check React DevTools Profiler**
   - Record interactions
   - Look for components with high render times
   - Identify unnecessary re-renders

3. **Check for Memory Leaks**
   ```typescript
   // Common leak: Missing cleanup in useEffect
   useEffect(() => {
     const interval = setInterval(() => {
       // ...
     }, 1000);

     return () => clearInterval(interval); // ✅ Cleanup
   }, []);
   ```

#### Solutions

**Unnecessary Re-renders**
- Apply `React.memo` to pure components
- Use `useMemo` for expensive computations
- Use `useCallback` to stabilize function references

**Large State Objects**
- Split large state into smaller pieces
- Use `useReducer` for complex state logic
- Implement virtualization for long lists

**Memory Leaks**
- Clean up timers and intervals
- Remove event listeners in cleanup functions
- Clear cache when data is no longer needed

### Issue: Database Query Timeouts

#### Diagnosis Steps

1. **Check Query Performance**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM issues
   WHERE project_id = 'xxx'
   AND status != 'Done'
   ORDER BY created_at DESC;
   ```

2. **Check Index Usage**
   ```sql
   -- Verify indexes are being used
   SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan ASC;
   ```

3. **Check Table Sizes**
   ```sql
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

#### Solutions

**Missing Indexes**
- Add indexes for frequently filtered columns
- Create composite indexes for multi-column filters
- Use partial indexes for filtered data

**Inefficient Queries**
- Select only needed columns
- Use `LIMIT` for large result sets
- Implement pagination
- Avoid N+1 queries with proper joins

**Lock Contention**
- Use shorter transactions
- Avoid long-running queries in transactions
- Implement optimistic concurrency control

### Issue: Slow React Components

#### Diagnosis Steps

1. **Profile with React DevTools**
   - Enable profiler
   - Record user interactions
   - Identify slow components

2. **Check Render Count**
   - Use React DevTools to see render count
   - Look for components rendering unnecessarily
   - Check prop changes

3. **Check Component Size**
   - Large components (>300 lines) are hard to optimize
   - Consider splitting into smaller components

#### Solutions

**Component Re-renders**
```typescript
// ❌ Before: Renders on every parent update
function ExpensiveComponent({ data }) {
  return <div>{heavyComputation(data)}</div>;
}

// ✅ After: Only re-renders when data changes
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  const result = useMemo(() => heavyComputation(data), [data]);
  return <div>{result}</div>;
});
```

**Expensive Computations**
```typescript
// ❌ Before: Recalculated on every render
function Component({ items }) {
  const sorted = items.sort((a, b) => a.value - b.value);
  return <div>{sorted.map(...)}</div>;
}

// ✅ After: Only recalculated when items change
function Component({ items }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.value - b.value),
    [items]
  );
  return <div>{sorted.map(...)}</div>;
}
```

**Event Handlers**
```typescript
// ❌ Before: New function on every render
function Component({ onClick }) {
  return <button onClick={() => onClick('data')}>Click</button>;
}

// ✅ After: Stable function reference
function Component({ onClick }) {
  const handleClick = useCallback(() => onClick('data'), [onClick]);
  return <button onClick={handleClick}>Click</button>;
}
```

## Performance Monitoring

### Real-Time Monitoring

**Check Current Metrics**
```bash
# Get recent performance metrics
curl http://localhost:3000/api/performance/report
```

**Check Active Bottlenecks**
```bash
# View identified bottlenecks
psql $DATABASE_URL -c "SELECT * FROM performance_bottlenecks WHERE status != 'RESOLVED' ORDER BY severity DESC;"
```

**Check Recent Alerts**
```bash
# View recent performance alerts
psql $DATABASE_URL -c "SELECT * FROM performance_metrics WHERE name LIKE '%alert%' AND timestamp > NOW() - INTERVAL '24 hours';"
```

### Automated Monitoring

**Run Performance Tests**
```bash
# Run all performance tests
pnpm test tests/performance

# Run specific test suite
pnpm test tests/performance/regression.test.ts
pnpm test tests/performance/bundle-size.test.ts
pnpm test tests/performance/query-performance.test.ts
```

**Generate Performance Report**
```bash
# Generate comprehensive report
curl -X POST http://localhost:3000/api/performance/report \
  -H "Content-Type: application/json" \
  -d '{"timeRange": "24h"}'
```

## Performance Regression Detection

### Detecting Regressions

**Run Regression Detection**
```typescript
import { regressionDetector } from '@/features/performance/lib/regression-detector';

const timeRange = {
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  end: new Date(),
};

const report = await regressionDetector.getRegressionReport(timeRange);
console.log(`Found ${report.summary.total} regressions`);
```

**Common Regression Causes**

1. **New Dependencies**
   - Check bundle size before/after
   - Evaluate if dependency is necessary
   - Look for smaller alternatives

2. **Database Schema Changes**
   - Missing indexes on new columns
   - Inefficient new queries
   - Large migrations not optimized

3. **Code Changes**
   - Inefficient algorithms (O(n²) instead of O(n))
   - Unnecessary re-renders
   - Missing memoization

### Recovery Steps

**1. Identify the Regression**
```bash
# Compare to previous deployment
git diff HEAD~1 HEAD -- src/

# Check bundle size
ANALYZE=true pnpm build

# Run tests
pnpm test tests/performance
```

**2. Revert or Fix**
```bash
# Option A: Revert the change
git revert HEAD

# Option B: Fix the issue
# Edit code to fix performance problem
pnpm test tests/performance
```

**3. Verify Fix**
```bash
# Re-run tests
pnpm test tests/performance

# Check metrics are back to normal
curl http://localhost:3000/api/performance/report
```

## Proactive Performance Maintenance

### Daily Tasks

- **Review Performance Dashboard**
  - Check for new bottlenecks
  - Review alert history
  - Verify baselines are being met

### Weekly Tasks

- **Performance Report**
  - Generate weekly performance summary
  - Track trends over time
  - Identify degrading metrics

- **Bundle Size Review**
  - Run `ANALYZE=true pnpm build`
  - Check for bundle size increases
  - Identify new large dependencies

### Monthly Tasks

- **Baseline Review**
  - Adjust baselines if needed
  - Update targets based on actual usage
  - Retire unused baselines

- **Index Review**
  - Check index usage statistics
  - Remove unused indexes
  - Add new indexes for emerging patterns

## Emergency Procedures

### Severe Performance Degradation

**Symptoms**: Page loads >10 seconds, database timeouts, high error rates

**Immediate Actions**

1. **Check Database Health**
   ```sql
   SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
   ```

2. **Check for Long-Running Queries**
   ```sql
   SELECT pid, now() - query_start as duration, query
   FROM pg_stat_activity
   WHERE state = 'active'
   ORDER BY duration DESC;
   ```

3. **Kill Long-Running Queries** (if necessary)
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE pid = <problematic-pid>;
   ```

4. **Check Server Resources**
   ```bash
   # CPU usage
   top

   # Memory usage
   free -h

   # Disk usage
   df -h
   ```

5. **Restart Services** (if needed)
   ```bash
   # Restart application
   pm2 restart hinear

   # Restart database (if necessary)
   sudo systemctl restart postgresql
   ```

### Rollback Procedure

If a deployment causes severe performance issues:

1. **Identify the Bad Deployment**
   ```bash
   git log --oneline -10
   ```

2. **Revert the Deployment**
   ```bash
   # Option A: Revert commit
   git revert HEAD

   # Option B: Roll back to previous commit
   git reset --hard HEAD~1
   ```

3. **Redeploy**
   ```bash
   pnpm build
   pnpm start
   # Or use your deployment process
   ```

4. **Verify Recovery**
   ```bash
   # Check performance is back to normal
   curl http://localhost:3000/api/performance/report
   ```

## Performance Tuning Parameters

### Database Configuration

**Shared Buffers** (Memory for caching)
```sql
SHOW shared_buffers; -- Default: 128MB
-- Recommended: 25% of RAM (up to 8GB)
```

**Effective Cache Size**
```sql
SHOW effective_cache_size; -- Default: 4GB
-- Recommended: 50-75% of RAM
```

**Work Memory**
```sql
SHOW work_mem; -- Default: 4MB
-- Increase for complex sorts or hash joins
```

### Application Configuration

**React Query Cache Duration**
```typescript
// src/lib/react-query/query-client.ts
staleTime: 5 * 60 * 1000, // 5 minutes
gcTime: 10 * 60 * 1000, // 10 minutes
```

**Profiling Sampling Rate**
```typescript
// src/features/performance/hooks/usePerformanceProfiler.ts
const samplingRate = process.env.NODE_ENV === "production" ? 0.01 : 1.0; // 1% in production
```

## Related Documentation

- [Performance Optimizations](./performance-optimizations.md)
- [Quick Start Guide](../specs/003-performance-audit/quickstart.md)
- [CLAUDE.md](../CLAUDE.md)

## Contact & Support

For performance-related issues:
- Check internal documentation first
- Review performance dashboard
- Contact database administrator for database issues
- Create GitHub issue with performance tag

## Last Updated

2026-03-26 - Initial runbook created
