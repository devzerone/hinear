// Metrics Recorder Hook
// Feature: 003-performance-audit

"use client";

import { useCallback, useEffect } from "react";
import type { MetricUnit } from "../contracts";

/**
 * Metrics recorder hook for recording custom performance metrics
 *
 * Usage:
 * ```typescript
 * export function MyComponent() {
 *   const recordMetric = useMetricsRecorder();
 *
 *   const handleLoad = () => {
 *     recordMetric("component_load_time", 150, "ms", { component: "MyComponent" });
 *   };
 *
 *   return <div onLoad={handleLoad}>...</div>;
 * }
 * ```
 *
 * @returns Function to record metrics
 */
export function useMetricsRecorder(): (
  name: string,
  value: number,
  unit: MetricUnit,
  metadata?: Record<string, unknown>
) => void {
  const recordMetric = useCallback(
    (
      name: string,
      value: number,
      unit: MetricUnit,
      metadata?: Record<string, unknown>
    ): void => {
      if (typeof window === "undefined") return;

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Metric] ${name}: ${value} ${unit}`, metadata || "");
      }

      // Send to performance API (fire and forget)
      fetch("/api/performance/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          value,
          unit,
          timestamp: new Date().toISOString(),
          metadata,
        }),
      }).catch(() => {
        // Silently fail - don't let metric recording break the app
      });
    },
    []
  );

  return recordMetric;
}

/**
 * Metrics recorder hook with automatic batching
 *
 * Batches metrics and sends them in groups to reduce network overhead
 *
 * Usage:
 * ```typescript
 * export function MyComponent() {
 *   const recordMetric = useBatchedMetricsRecorder(1000); // batch every 1s
 *
 *   useEffect(() => {
 *     recordMetric("metric1", 100, "ms");
 *     recordMetric("metric2", 200, "ms");
 *     // Metrics will be sent together after 1s
 *   }, []);
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @param batchInterval - Milliseconds to wait before sending batch (default: 1000ms)
 * @returns Function to record metrics
 */
export function useBatchedMetricsRecorder(
  batchInterval: number = 1000
): (
  name: string,
  value: number,
  unit: MetricUnit,
  metadata?: Record<string, unknown>
) => void {
  const metricsRef = useRef<
    Array<{
      name: string;
      value: number;
      unit: MetricUnit;
      timestamp: string;
      metadata?: Record<string, unknown>;
    }>
  >([]);

  const flushMetrics = useCallback(() => {
    if (metricsRef.current.length === 0) return;

    const metrics = [...metricsRef.current];
    metricsRef.current = [];

    // Send batched metrics
    fetch("/api/performance/metrics/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metrics }),
    }).catch(() => {
      // Silently fail
    });
  }, []);

  const recordMetric = useCallback(
    (
      name: string,
      value: number,
      unit: MetricUnit,
      metadata?: Record<string, unknown>
    ): void => {
      metricsRef.current.push({
        name,
        value,
        unit,
        timestamp: new Date().toISOString(),
        metadata,
      });
    },
    []
  );

  // Flush metrics on interval
  useEffect(() => {
    const interval = setInterval(flushMetrics, batchInterval);
    return () => clearInterval(interval);
  }, [batchInterval, flushMetrics]);

  // Flush metrics on unmount
  useEffect(() => {
    return () => {
      flushMetrics();
    };
  }, [flushMetrics]);

  return recordMetric;
}

// Import useRef
import { useRef } from "react";
