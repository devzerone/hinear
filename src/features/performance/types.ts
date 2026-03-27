// Performance Investigation and Optimization Domain Types
// Feature: 003-performance-audit

import type {
  BottleneckCategory,
  BottleneckSeverity,
  BottleneckStatus,
  Environment,
  MetricUnit,
} from "./contracts";

// Re-export commonly used types
export type {
  BottleneckCategory,
  BottleneckSeverity,
  BottleneckStatus,
  Environment,
  MetricUnit,
};

// ============================================================================
// Domain Entity Types
// ============================================================================

/**
 * PerformanceMetric - Represents a measurable aspect of system performance
 *
 * Fields:
 * - id: Unique identifier (UUID)
 * - name: Metric name (e.g., "page_load_time", "query_duration", "bundle_size")
 * - value: Measured value
 * - unit: Unit of measurement (ms, s, KB, MB, count, percentage)
 * - timestamp: When the metric was recorded
 * - route: App route where metric was collected (e.g., "/projects/[id]")
 * - environment: Environment (development, staging, production)
 * - metadata: Additional context (user agent, device type, etc.)
 */
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: MetricUnit;
  timestamp: Date;
  route: string | null;
  environment: Environment;
  metadata: Record<string, unknown> | null;
}

/**
 * PerformanceBottleneck - Represents a specific issue causing performance degradation
 *
 * Fields:
 * - id: Unique identifier (UUID)
 * - title: Human-readable description
 * - category: Bottleneck category (DATABASE_QUERY, LARGE_BUNDLE, SLOW_API, etc.)
 * - severity: Severity rating (CRITICAL, HIGH, MEDIUM, LOW)
 * - description: Detailed explanation
 * - location: Code location or route where issue occurs
 * - currentValue: Current measured value
 * - targetValue: Expected/target value
 * - unit: Unit of measurement
 * - impact: User experience impact description
 * - suggestion: Recommended fix approach
 * - status: Resolution status (IDENTIFIED, IN_PROGRESS, RESOLVED)
 * - identifiedAt: When bottleneck was identified
 * - resolvedAt: When bottleneck was resolved
 */
export interface PerformanceBottleneck {
  id: string;
  title: string;
  category: BottleneckCategory;
  severity: BottleneckSeverity;
  description: string;
  location: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  impact: string;
  suggestion: string;
  status: BottleneckStatus;
  identifiedAt: Date;
  resolvedAt: Date | null;
}

/**
 * PerformanceBaseline - Represents target or expected performance values
 *
 * Fields:
 * - id: Unique identifier (UUID)
 * - metricName: Name of the metric this baseline applies to
 * - route: Route this baseline applies to (null = global)
 * - targetValue: Target performance value
 * - warningThreshold: Warning threshold (e.g., 1.5x target)
 * - criticalThreshold: Critical threshold (e.g., 2x target)
 * - unit: Unit of measurement
 * - createdAt: When baseline was established
 * - updatedAt: When baseline was last updated
 */
export interface PerformanceBaseline {
  id: string;
  metricName: string;
  route: string | null;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * OptimizationRecord - Documents a performance improvement made
 *
 * Fields:
 * - id: Unique identifier (UUID)
 * - bottleneckId: Reference to PerformanceBottleneck
 * - title: Optimization title
 * - description: Detailed description of changes made
 * - beforeValue: Performance value before optimization
 * - afterValue: Performance value after optimization
 * - improvementPercentage: Percentage improvement
 * - implementation: Technical implementation details
 * - createdAt: When optimization was implemented
 * - verifiedAt: When improvement was verified
 */
export interface OptimizationRecord {
  id: string;
  bottleneckId: string;
  title: string;
  description: string;
  beforeValue: number;
  afterValue: number;
  improvementPercentage: number;
  implementation: string;
  createdAt: Date;
  verifiedAt: Date | null;
}

// ============================================================================
// Input/Output DTOs
// ============================================================================

/**
 * Input for recording a performance metric
 */
export interface RecordMetricInput {
  name: string;
  value: number;
  unit: MetricUnit;
  timestamp?: Date;
  route?: string;
  environment?: Environment;
  metadata?: Record<string, unknown>;
}

/**
 * Input for creating a performance baseline
 */
export interface CreateBaselineInput {
  metricName: string;
  route?: string;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
}

/**
 * Input for updating a performance baseline
 */
export interface UpdateBaselineInput {
  metricName: string;
  route?: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

/**
 * Input for creating a bottleneck
 */
export interface CreateBottleneckInput {
  title: string;
  category: BottleneckCategory;
  severity: BottleneckSeverity;
  description: string;
  location: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  impact: string;
  suggestion: string;
}

/**
 * Input for recording an optimization
 */
export interface RecordOptimizationInput {
  bottleneckId: string;
  title: string;
  description: string;
  beforeValue: number;
  afterValue: number;
  implementation: string;
}

/**
 * Performance report query parameters
 */
export interface PerformanceReportQuery {
  timeRange: {
    start: Date;
    end: Date;
  };
  routes?: string[];
  environments?: Environment[];
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Time range for queries
 */
export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
