// Metric Collector - Core performance measurement utility
// Feature: 003-performance-audit

import type {
  MetricCollector as IMetricCollector,
  MetricUnit,
} from "../contracts";

/**
 * MetricCollector class for recording performance measurements
 *
 * Usage:
 * ```typescript
 * const collector = new MetricCollector("session-123");
 * collector.mark("operation-start");
 * // ... do work ...
 * collector.measure("operation"); // returns duration in ms
 * await collector.recordMetric("custom_metric", 100, MetricUnit.MILLISECONDS);
 * const metrics = collector.getMetrics();
 * ```
 */
export class MetricCollector implements IMetricCollector {
  private sessionId: string;
  private metrics: Map<string, number> = new Map();
  private startTime: number;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.startTime = performance.now();
  }

  /**
   * Mark a point in time for later measurement
   * @param name - Unique name for this mark
   */
  mark(name: string): void {
    if (typeof performance === "undefined") {
      console.warn("[MetricCollector] Performance API not available");
      return;
    }
    performance.mark(`${this.sessionId}-${name}-start`);
  }

  /**
   * Measure the duration from a mark to now
   * @param name - Name of the mark to measure from
   * @returns Duration in milliseconds
   */
  measure(name: string): number {
    if (typeof performance === "undefined") {
      console.warn("[MetricCollector] Performance API not available");
      return 0;
    }

    try {
      performance.mark(`${this.sessionId}-${name}-end`);
      performance.measure(
        `${this.sessionId}-${name}`,
        `${this.sessionId}-${name}-start`,
        `${this.sessionId}-${name}-end`
      );

      const entries = performance.getEntriesByName(
        `${this.sessionId}-${name}`,
        "measure"
      );
      if (entries.length > 0) {
        const duration = entries[0].duration;
        this.metrics.set(name, duration);

        // Clean up marks and measures
        performance.clearMarks(`${this.sessionId}-${name}-start`);
        performance.clearMarks(`${this.sessionId}-${name}-end`);
        performance.clearMeasures(`${this.sessionId}-${name}`);

        return duration;
      }
    } catch (error) {
      console.error("[MetricCollector] Error measuring:", error);
    }

    return 0;
  }

  /**
   * Record a metric to the performance monitoring system
   * @param name - Metric name
   * @param value - Metric value
   * @param unit - Unit of measurement
   * @param metadata - Additional context
   */
  async recordMetric(
    name: string,
    value: number,
    unit: MetricUnit,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const response = await fetch("/api/performance/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.sessionId,
          name,
          value,
          unit,
          timestamp: new Date().toISOString(),
          metadata: {
            ...metadata,
            sessionDuration: performance.now() - this.startTime,
          },
        }),
      });

      if (!response.ok) {
        console.error(
          "[MetricCollector] Failed to record metric:",
          await response.text()
        );
      }
    } catch (error) {
      // Fire and forget - don't let metric recording errors break the app
      console.error("[MetricCollector] Error recording metric:", error);
    }
  }

  /**
   * Get all collected metrics
   * @returns Object with metric names and values
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Clear all collected metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get the session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get the total session duration
   */
  getSessionDuration(): number {
    if (typeof performance === "undefined") {
      return 0;
    }
    return performance.now() - this.startTime;
  }
}
