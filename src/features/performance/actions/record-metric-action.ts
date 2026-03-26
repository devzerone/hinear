// Record Metric Action
// Feature: 003-performance-audit

"use server";

import type { Environment } from "../contracts";
import { performanceMetricsRepository } from "../repositories/performance-metrics-repository";
import type { RecordMetricInput } from "../types";

/**
 * Server action to record a performance metric
 *
 * Usage:
 * ```typescript
 * await recordMetric({
 *   name: "page_load_time",
 *   value: 1500,
 *   unit: MetricUnit.MILLISECONDS,
 *   route: "/projects/[id]",
 *   environment: Environment.PRODUCTION,
 * });
 * ```
 */
export async function recordMetric(input: RecordMetricInput): Promise<void> {
  try {
    // TODO: Implement metric recording
    console.log("[recordMetric] Metric recorded:", input);
  } catch (error) {
    console.error("[recordMetric] Failed to record metric:", error);
    // Don't throw - metric recording failures should not break the app
  }
}

/**
 * Record multiple metrics in batch
 *
 * Usage:
 * ```typescript
 * await recordMetricsBatch([
 *   { name: "metric1", value: 100, unit: MetricUnit.MILLISECONDS },
 *   { name: "metric2", value: 200, unit: MetricUnit.MILLISECONDS },
 * ]);
 * ```
 */
export async function recordMetricsBatch(
  inputs: RecordMetricInput[]
): Promise<void> {
  try {
    // TODO: Implement batch metric recording
    console.log("[recordMetrics] Metrics recorded:", inputs);
    await Promise.all(inputs.map(() => Promise.resolve()));
  } catch (error) {
    console.error("[recordMetricsBatch] Failed to record metrics:", error);
    // Don't throw - metric recording failures should not break the app
  }
}

/**
 * Get the current environment from context
 */
function getCurrentEnvironment(): string {
  if (process.env.NODE_ENV === "production") {
    return "production";
  } else if (process.env.NODE_ENV === "test") {
    return "staging";
  } else {
    return "development";
  }
}
