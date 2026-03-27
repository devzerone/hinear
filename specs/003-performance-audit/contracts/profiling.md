# Performance Profiling Contract

**Feature**: 003-performance-audit
**Purpose**: Define interfaces for performance profiling and metric collection

## Overview

This contract defines the interfaces for profiling application performance, collecting metrics, and generating performance reports. These interfaces are used by the performance monitoring system to collect, store, and analyze performance data.

## Types

### Metric Category

```typescript
enum MetricCategory {
  PAGE_LOAD = 'page_load',
  DATABASE_QUERY = 'database_query',
  API_RESPONSE = 'api_response',
  BUNDLE_SIZE = 'bundle_size',
  MEMORY_USAGE = 'memory_usage',
  RENDER_TIME = 'render_time',
  WEB_VITAL = 'web_vital',
}
```

### Metric Unit

```typescript
enum MetricUnit {
  MILLISECONDS = 'ms',
  SECONDS = 's',
  KILOBYTES = 'KB',
  MEGABYTES = 'MB',
  COUNT = 'count',
  PERCENTAGE = 'percentage',
  SCORE = 'score', // 0-100 for Web Vitals
}
```

### Performance Metric

```typescript
interface PerformanceMetric {
  id: string;
  name: string;
  category: MetricCategory;
  value: number;
  unit: MetricUnit;
  timestamp: Date;
  route: string | null;
  environment: 'development' | 'staging' | 'production';
  metadata: Record<string, unknown>;
}
```

### Profiling Session

```typescript
interface ProfilingSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  route: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | null;
  metrics: PerformanceMetric[];
  status: 'active' | 'completed' | 'failed';
}
```

## Interfaces

### Metric Collector

```typescript
interface MetricCollector {
  /**
   * Start a new profiling session
   */
  startSession(route: string, context: ProfilingContext): Promise<ProfilingSession>;

  /**
   * Record a single metric
   */
  recordMetric(sessionId: string, metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void>;

  /**
   * Record multiple metrics at once
   */
  recordBatch(sessionId: string, metrics: Omit<PerformanceMetric, 'id' | 'timestamp'>[]): Promise<void>;

  /**
   * End a profiling session
   */
  endSession(sessionId: string): Promise<void>;

  /**
   * Get metrics for a session
   */
  getSessionMetrics(sessionId: string): Promise<PerformanceMetric[]>;
}
```

### Profiling Context

```typescript
interface ProfilingContext {
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  connectionType?: 'slow-2g' | '2g' | '3g' | '4g';
  userId?: string;
  sessionId?: string;
}
```

### Web Vitals

```typescript
interface WebVitals {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint (target: <2.5s)
  fid: number; // First Input Delay (target: <100ms)
  cls: number; // Cumulative Layout Shift (target: <0.1)

  // Other Vitals
  ttfb: number; // Time to First Byte (target: <600ms)
  fcp: number; // First Contentful Paint (target: <1.8s)
  tti: number; // Time to Interactive (target: <3.8s)

  timestamp: Date;
  route: string;
}
```

### Bundle Analysis

```typescript
interface BundleAnalysis {
  route: string;
  totalSize: number; // bytes
  gzipSize: number; // bytes
  chunks: BundleChunk[];
  dependencies: BundleDependency[];
}

interface BundleChunk {
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
}

interface BundleDependency {
  name: string;
  version: string;
  size: number;
  gzipSize: number;
}
```

### Query Analysis

```typescript
interface QueryAnalysis {
  queryName: string;
  executionTime: number; // milliseconds
  rowCount: number;
  timestamp: Date;
  route: string;
  slow: boolean; // true if >200ms
  query: string; // sanitized query string
}
```

### Performance Report

```typescript
interface PerformanceReport {
  id: string;
  generatedAt: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalMetrics: number;
    averagePageLoadTime: number;
    slowQueriesCount: number;
    averageBundleSize: number;
    webVitals: {
      averageLCP: number;
      averageFID: number;
      averageCLS: number;
    };
  };
  bottlenecks: PerformanceBottleneck[];
  recommendations: OptimizationRecommendation[];
}
```

## Functions

### Profiling Functions

```typescript
/**
 * Profile a page load and collect all relevant metrics
 */
async function profilePageLoad(route: string): Promise<PerformanceReport>;

/**
 * Profile database queries and identify slow ones
 */
async function profileQueries(queries: QueryAnalysis[]): Promise<QueryAnalysisReport>;

/**
 * Analyze bundle size and identify large dependencies
 */
async function analyzeBundle(route: string): Promise<BundleAnalysis>;

/**
 * Collect Web Vitals for current page
 */
async function collectWebVitals(): Promise<WebVitals>;
```

### Analysis Functions

```typescript
/**
 * Analyze metrics and identify bottlenecks
 */
async function identifyBottlenecks(metrics: PerformanceMetric[]): Promise<PerformanceBottleneck[]>;

/**
 * Compare metrics against baselines and report violations
 */
async function checkBaselines(metrics: PerformanceMetric[]): Promise<BaselineViolation[]>;

/**
 * Generate optimization recommendations based on bottlenecks
 */
async function generateRecommendations(bottlenecks: PerformanceBottleneck[]): Promise<OptimizationRecommendation[]>;
```

## Events

### Metric Events

```typescript
interface MetricRecordedEvent {
  type: 'metric_recorded';
  metric: PerformanceMetric;
  timestamp: Date;
}

interface BottleneckIdentifiedEvent {
  type: 'bottleneck_identified';
  bottleneck: PerformanceBottleneck;
  timestamp: Date;
}

interface BaselineViolatedEvent {
  type: 'baseline_violated';
  violation: BaselineViolation;
  timestamp: Date;
}
```

## Error Handling

### Error Types

```typescript
class ProfilingError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ProfilingError';
  }
}

class MetricCollectionError extends ProfilingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'METRIC_COLLECTION_ERROR', context);
    this.name = 'MetricCollectionError';
  }
}

class SessionNotFoundError extends ProfilingError {
  constructor(sessionId: string) {
    super(`Profiling session not found: ${sessionId}`, 'SESSION_NOT_FOUND', { sessionId });
    this.name = 'SessionNotFoundError';
  }
}
```

## Validation Rules

### Metric Validation

```typescript
/**
 * Validate a performance metric
 */
function validateMetric(metric: PerformanceMetric): ValidationResult {
  const errors: string[] = [];

  if (metric.value < 0) {
    errors.push('Metric value must be non-negative');
  }

  if (metric.timestamp > new Date()) {
    errors.push('Metric timestamp cannot be in the future');
  }

  if (!['development', 'staging', 'production'].includes(metric.environment)) {
    errors.push('Invalid environment');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

## Implementation Notes

### Sampling Strategy

```typescript
/**
 * Determine if a session should be profiled based on sampling rate
 */
function shouldProfileSession(samplingRate: number): boolean {
  return Math.random() < samplingRate;
}

// Usage
const SAMPLING_RATE = 0.01; // 1% of sessions
if (shouldProfileSession(SAMPLING_RATE)) {
  // Enable profiling for this session
}
```

### Performance Marks

```typescript
/**
 * Mark performance timing for critical operations
 */
function markPerformance(name: string): void {
  performance.mark(`${name}-start`);
}

function measurePerformance(name: string): number {
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
  const measure = performance.getEntriesByName(name)[0];
  return measure.duration;
}

// Usage
markPerformance('issue-load');
await loadIssue(issueId);
const duration = measurePerformance('issue-load');
```

## Usage Example

```typescript
// Start profiling session
const collector = createMetricCollector();
const session = await collector.startSession('/projects/123', {
  userAgent: navigator.userAgent,
  deviceType: 'desktop',
  connectionType: '4g',
});

// Record metrics
await collector.recordMetric(session.id, {
  name: 'page_load_time',
  category: MetricCategory.PAGE_LOAD,
  value: 1500,
  unit: MetricUnit.MILLISECONDS,
  route: '/projects/123',
  environment: 'production',
  metadata: {},
});

// End session and get report
await collector.endSession(session.id);
const report = await generatePerformanceReport(session.id);
```
