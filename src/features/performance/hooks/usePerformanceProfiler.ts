// Performance Profiler Hook
// Feature: 003-performance-audit

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { MetricCollector } from "../lib/metric-collector";

/**
 * Performance profiler hook for monitoring page load and interaction performance
 *
 * Usage:
 * ```typescript
 * export function IssueDetailPage() {
 *   usePerformanceProfiler(process.env.NODE_ENV === 'production');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @param enabled - Whether profiling is enabled (default: false)
 * @param samplingRate - Percentage of sessions to profile (default: 0.01 = 1%)
 */
export function usePerformanceProfiler(
  enabled: boolean = false,
  samplingRate: number = 0.01
): void {
  const pathname = usePathname();
  const collectorRef = useRef<MetricCollector | null>(null);

  useEffect(() => {
    // Skip if not enabled or if already profiling this route
    if (!enabled || collectorRef.current) return;

    // Only profile a percentage of sessions (default 1%)
    if (Math.random() > samplingRate) return;

    // Create a new session
    const sessionId = crypto.randomUUID();
    const collector = new MetricCollector(sessionId);
    collectorRef.current = collector;

    // Mark page load start
    collector.mark("page-load-start");
    collector.mark("first-contentful-paint");

    // Log navigation
    console.log(
      "[Performance Profiler] Started profiling session:",
      sessionId,
      "for route:",
      pathname
    );

    // Cleanup on unmount
    return () => {
      if (collectorRef.current) {
        const duration = collectorRef.current.measure("page-load");
        const sessionDuration = collectorRef.current.getSessionDuration();
        const metrics = collectorRef.current.getMetrics();

        console.log("[Performance Profiler] Session ended:", {
          sessionId,
          route: pathname,
          pageLoadDuration: duration,
          sessionDuration,
          metrics,
        });

        // Record aggregate metrics
        collectorRef.current.recordMetric(
          "page_load_time",
          duration,
          "ms" as any as any,
          {
            route: pathname,
          }
        );

        collectorRef.current.recordMetric(
          "session_duration",
          sessionDuration,
          "ms" as any,
          {
            route: pathname,
          }
        );

        collectorRef.current = null;
      }
    };
  }, [pathname, enabled, samplingRate]);

  // Re-run when route changes
  useEffect(() => {
    if (!enabled || !collectorRef.current) return;

    // Measure route transition
    const startMark = `route-${pathname}-start`;
    collectorRef.current.mark(startMark);

    return () => {
      if (collectorRef.current) {
        const duration = collectorRef.current.measure(`route-${pathname}`);
        collectorRef.current.recordMetric(
          "route_transition",
          duration,
          "ms" as any,
          {
            from: pathname,
          }
        );
      }
    };
  }, [pathname, enabled]);
}

/**
 * Performance profiler hook for measuring specific operations
 *
 * Usage:
 * ```typescript
 * export function MyComponent() {
 *   const profileOperation = usePerformanceProfilerOp();
 *
 *   const handleClick = async () => {
 *     const result = await profileOperation("save_issue", async () => {
 *       return await saveIssue(issue);
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>Save</button>;
 * }
 * ```
 *
 * @returns Function to profile operations
 */
export function usePerformanceProfilerOp(): <T>(
  name: string,
  fn: () => Promise<T>
) => Promise<T> {
  return async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;

      console.log(`[Performance Operation] ${name}: ${duration.toFixed(2)}ms`);

      // Record metric (fire and forget)
      if (typeof window !== "undefined") {
        fetch("/api/performance/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "operation_duration",
            value: duration,
            unit: "ms" as any,
            metadata: { operationName: name },
          }),
        }).catch(() => {
          // Silently fail
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(
        `[Performance Operation Error] ${name}: ${duration.toFixed(2)}ms`,
        error
      );
      throw error;
    }
  };
}
