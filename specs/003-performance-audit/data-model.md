# Data Model: Performance Investigation and Optimization

**Feature**: 003-performance-audit
**Date**: 2026-03-26
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data model for performance monitoring, profiling, and optimization in the Hinear application. All entities follow the domain-driven design principles established in the constitution.

## Core Entities

### 1. PerformanceMetric

**Purpose**: Represents a measurable aspect of system performance

**Fields**:
- `id`: string (UUID) - Unique identifier
- `name`: string - Metric name (e.g., "page_load_time", "query_duration", "bundle_size")
- `value`: number - Measured value
- `unit`: string - Unit of measurement (ms, KB, count, etc.)
- `timestamp`: DateTime - When the metric was recorded
- `route`: string | null - App route where metric was collected (e.g., "/projects/[id]")
- `environment`: string - Environment (development, staging, production)
- `metadata`: Record<string, unknown> - Additional context (user agent, device type, etc.)

**Validation Rules**:
- `value` must be non-negative
- `unit` must be one of: ms, s, KB, MB, count, percentage
- `environment` must be one of: development, staging, production
- `timestamp` cannot be in the future

**Indexes**:
- Primary: `id`
- Query: `timestamp`, `name`, `environment`
- Composite: `(name, timestamp, environment)` for time-series queries

### 2. PerformanceBottleneck

**Purpose**: Represents a specific issue causing performance degradation

**Fields**:
- `id`: string (UUID) - Unique identifier
- `title`: string - Human-readable description
- `category`: enum - Bottleneck category
  - `DATABASE_QUERY`: Slow database queries
  - `LARGE_BUNDLE`: Excessive JavaScript bundle size
  - `SLOW_API`: High API response time
  - `MEMORY_LEAK`: Memory leaks or excessive usage
  - `EXCESSIVE_RENDERS`: Unnecessary React re-renders
  - `NETWORK_REQUESTS`: Too many network requests
  - `SLOW_LCP`: Slow Largest Contentful Paint
- `severity`: enum - Severity rating
  - `CRITICAL`: Immediate action required (>5x slower than target)
  - `HIGH`: Urgent action needed (3-5x slower than target)
  - `MEDIUM`: Should fix soon (2-3x slower than target)
  - `LOW`: Nice to have (1-2x slower than target)
- `description`: string - Detailed explanation
- `location`: string - Code location or route where issue occurs
- `currentValue`: number - Current measured value
- `targetValue`: number - Expected/target value
- `unit`: string - Unit of measurement
- `impact`: string - User experience impact description
- `suggestion`: string - Recommended fix approach
- `status`: enum - Resolution status
  - `IDENTIFIED`: Issue found, not yet addressed
  - `IN_PROGRESS`: Being worked on
  - `RESOLVED`: Fix implemented and verified
- `identifiedAt`: DateTime - When bottleneck was identified
- `resolvedAt`: DateTime | null - When bottleneck was resolved

**Validation Rules**:
- `severity` cannot be `LOW` if `currentValue` > 5x `targetValue`
- `resolvedAt` must be null if `status` is not `RESOLVED`
- `targetValue` must be greater than 0

**Relationships**:
- References `PerformanceMetric` (one-to-many)
- Referenced by `OptimizationRecord` (one-to-many)

### 3. PerformanceBaseline

**Purpose**: Represents target or expected performance values

**Fields**:
- `id`: string (UUID) - Unique identifier
- `metricName`: string - Name of the metric this baseline applies to
- `route`: string | null - Route this baseline applies to (null = global)
- `targetValue`: number - Target performance value
- `warningThreshold`: number - Warning threshold (e.g., 1.5x target)
- `criticalThreshold`: number - Critical threshold (e.g., 2x target)
- `unit`: string - Unit of measurement
- `createdAt`: DateTime - When baseline was established
- `updatedAt`: DateTime - When baseline was last updated

**Validation Rules**:
- `warningThreshold` must be > `targetValue`
- `criticalThreshold` must be > `warningThreshold`
- `targetValue` must be greater than 0

**Relationships**:
- References `PerformanceMetric` (one-to-one by metricName)

### 4. OptimizationRecord

**Purpose**: Documents a performance improvement made

**Fields**:
- `id`: string (UUID) - Unique identifier
- `bottleneckId`: string - Reference to PerformanceBottleneck
- `title`: string - Optimization title
- `description`: string - Detailed description of changes made
- `beforeValue`: number - Performance value before optimization
- `afterValue`: number - Performance value after optimization
- `improvementPercentage`: number - Percentage improvement
- `implementation`: string - Technical implementation details
- `createdAt`: DateTime - When optimization was implemented
- `verifiedAt`: DateTime | null - When improvement was verified

**Validation Rules**:
- `afterValue` must be < `beforeValue` (performance improved)
- `improvementPercentage` must be positive
- `verifiedAt` cannot be before `createdAt`

**Relationships**:
- References `PerformanceBottleneck` (many-to-one)

## Entity Relationships

```
PerformanceMetric (1) ----< (1) PerformanceBaseline
                          (by metricName)

PerformanceMetric (1) ----< (many) PerformanceBottleneck
                          (metric reference)

PerformanceBottleneck (1) ----< (many) OptimizationRecord
```

## State Transitions

### PerformanceBottleneck Status Flow

```
IDENTIFIED → IN_PROGRESS → RESOLVED
    ↑            ↓
    └────────────┘
      (can reopen if regresses)
```

**Transition Rules**:
- `IDENTIFIED` → `IN_PROGRESS`: When work begins on fix
- `IN_PROGRESS` → `RESOLVED`: When fix is implemented and verified
- `RESOLVED` → `IDENTIFIED`: If issue reoccurs (regression)
- Cannot skip `IN_PROGRESS` when going from `IDENTIFIED` to `RESOLVED`

## Data Storage Strategy

### Supabase Tables

**Table: performance_metrics**
```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('ms', 's', 'KB', 'MB', 'count', 'percentage')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  route TEXT,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  metadata JSONB,
  CONSTRAINT metrics_value_non_negative CHECK (value >= 0),
  CONSTRAINT metrics_timestamp_not_future CHECK (timestamp <= NOW())
);

CREATE INDEX idx_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX idx_metrics_name_timestamp_env ON performance_metrics(name, timestamp, environment);
```

**Table: performance_bottlenecks**
```sql
CREATE TABLE performance_bottlenecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'DATABASE_QUERY', 'LARGE_BUNDLE', 'SLOW_API', 'MEMORY_LEAK',
    'EXCESSIVE_RENDERS', 'NETWORK_REQUESTS', 'SLOW_LCP'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  impact TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('IDENTIFIED', 'IN_PROGRESS', 'RESOLVED')),
  identified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT bottlenecks_target_positive CHECK (target_value > 0),
  CONSTRAINT bottlenecks_resolved_at_status CHECK (
    (status = 'RESOLVED' AND resolved_at IS NOT NULL) OR
    (status != 'RESOLVED' AND resolved_at IS NULL)
  )
);
```

**Table: performance_baselines**
```sql
CREATE TABLE performance_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL UNIQUE,
  route TEXT,
  target_value NUMERIC NOT NULL,
  warning_threshold NUMERIC NOT NULL,
  critical_threshold NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT baselines_target_positive CHECK (target_value > 0),
  CONSTRAINT baselines_thresholds_ordered CHECK (
    target_value < warning_threshold AND warning_threshold < critical_threshold
  )
);
```

**Table: optimization_records**
```sql
CREATE TABLE optimization_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottleneck_id UUID NOT NULL REFERENCES performance_bottlenecks(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  before_value NUMERIC NOT NULL,
  after_value NUMERIC NOT NULL,
  improvement_percentage NUMERIC NOT NULL,
  implementation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  CONSTRAINT optimizations_improvement CHECK (after_value < before_value),
  CONSTRAINT optimizations_percentage_positive CHECK (improvement_percentage > 0),
  CONSTRAINT optimizations_verified_after_created CHECK (
    verified_at IS NULL OR verified_at >= created_at
  )
);
```

## Caching Strategy

### Performance Metrics Cache
- **TTL**: 5 minutes for recent metrics
- **Invalidation**: Write-through cache
- **Storage**: Redis or in-memory (if small dataset)

### Baselines Cache
- **TTL**: 1 hour (baselines change infrequently)
- **Invalidation**: Manual on baseline update
- **Storage**: In-memory cache

### Bottlenecks Cache
- **TTL**: No cache (always fetch fresh)
- **Rationale**: Bottlenecks change frequently, must be current

## Privacy and Security

### Data Collection
- **Sampling**: Only collect metrics from 1-5% of user sessions
- **Anonymization**: No user-identifiable information in metrics
- **Aggregation**: Store only aggregated data, no individual user traces

### Access Control
- **Read access**: All authenticated users can view performance data
- **Write access**: Only system processes can record metrics
- **Admin access**: Only admins can modify baselines and bottlenecks

### Data Retention
- **Raw metrics**: 30 days
- **Aggregated metrics**: 1 year
- **Bottlenecks**: Indefinite (until resolved)
- **Optimization records**: Indefinite (historical record)

## Migration Strategy

### Phase 1: Schema Creation
1. Create all tables in Supabase
2. Set up indexes for query performance
3. Create RLS policies for access control

### Phase 2: Baseline Population
1. Insert initial performance baselines based on success criteria
2. Set up baseline update mechanism

### Phase 3: Data Collection Start
1. Enable metric collection in application
2. Verify data is being recorded
3. Validate data quality

## Next Steps

1. Create contract definitions in `/contracts/` directory
2. Define TypeScript types based on this data model
3. Create repository interfaces for data access
4. Implement monitoring and alerting logic
