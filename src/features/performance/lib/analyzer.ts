// Performance Analyzer
// Feature: 003-performance-audit

/**
 * Performance analysis utilities for identifying bottlenecks
 */

import {
  BottleneckCategory,
  BottleneckSeverity,
  BottleneckStatus,
} from "../contracts";
import type { PerformanceBottleneck, PerformanceMetric } from "../types";

/**
 * Analyze metrics to identify performance bottlenecks
 *
 * @param metrics - Array of performance metrics to analyze
 * @param baselines - Optional baselines to compare against
 * @returns Array of identified bottlenecks
 */
export function analyzeMetrics(
  metrics: PerformanceMetric[],
  baselines?: Map<string, { targetValue: number; unit: string }>
): Omit<PerformanceBottleneck, "id">[] {
  const bottlenecks: Omit<PerformanceBottleneck, "id">[] = [];

  // Group metrics by name and route
  const grouped = groupMetricsByName(metrics);

  for (const [metricKey, metricGroup] of Object.entries(grouped)) {
    const [name, route] = metricKey.split("|");

    // Calculate average value
    const avgValue =
      metricGroup.reduce((sum, m) => sum + m.value, 0) / metricGroup.length;
    const _maxValue = Math.max(...metricGroup.map((m) => m.value));

    // Get baseline if available
    const baseline = baselines?.get(name);
    const targetValue = baseline?.targetValue ?? getDefaultTarget(name);
    const unit = baseline?.unit ?? getDefaultUnit(name);

    // Check if this metric exceeds thresholds
    const ratio = avgValue / targetValue;

    if (ratio >= 2) {
      // This is a potential bottleneck (2x or worse than target)
      const severity = calculateSeverity(ratio);
      const category = getCategoryForMetric(name);
      const currentValue = avgValue;

      bottlenecks.push({
        title: generateBottleneckTitle(name, route, severity),
        category,
        severity,
        description: generateDescription(name, currentValue, targetValue, unit),
        location: route || "global",
        currentValue,
        targetValue,
        unit,
        impact: generateImpact(category, severity),
        suggestion: generateSuggestion(category, name),
        status: BottleneckStatus.IDENTIFIED,
        identifiedAt: new Date(),
        resolvedAt: null,
      });
    }
  }

  return bottlenecks;
}

/**
 * Group metrics by name and route
 */
function groupMetricsByName(
  metrics: PerformanceMetric[]
): Record<string, PerformanceMetric[]> {
  return metrics.reduce(
    (acc, metric) => {
      const key = `${metric.name}|${metric.route || "global"}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric);
      return acc;
    },
    {} as Record<string, PerformanceMetric[]>
  );
}

/**
 * Calculate severity based on ratio of current to target value
 */
function calculateSeverity(ratio: number): BottleneckSeverity {
  if (ratio > 5) return BottleneckSeverity.CRITICAL;
  if (ratio > 3) return BottleneckSeverity.HIGH;
  if (ratio > 2) return BottleneckSeverity.MEDIUM;
  return BottleneckSeverity.LOW;
}

/**
 * Get category for a metric name
 */
function getCategoryForMetric(metricName: string): BottleneckCategory {
  if (metricName.includes("query") || metricName.includes("database")) {
    return BottleneckCategory.DATABASE_QUERY;
  }
  if (metricName.includes("bundle") || metricName.includes("bundle_size")) {
    return BottleneckCategory.LARGE_BUNDLE;
  }
  if (metricName.includes("api") || metricName.includes("response")) {
    return BottleneckCategory.SLOW_API;
  }
  if (metricName.includes("memory")) {
    return BottleneckCategory.MEMORY_LEAK;
  }
  if (metricName.includes("render") || metricName.includes("paint")) {
    return BottleneckCategory.EXCESSIVE_RENDERS;
  }
  if (metricName.includes("network") || metricName.includes("request")) {
    return BottleneckCategory.NETWORK_REQUESTS;
  }
  if (
    metricName.includes("LCP") ||
    metricName.includes("FCP") ||
    metricName.includes("CLS")
  ) {
    return BottleneckCategory.SLOW_LCP;
  }

  return BottleneckCategory.SLOW_API; // Default
}

/**
 * Generate bottleneck title
 */
function generateBottleneckTitle(
  metricName: string,
  route: string,
  severity: BottleneckSeverity
): string {
  const location = route ? ` on ${route}` : "";
  const severityText =
    severity === BottleneckSeverity.CRITICAL ? "Critical " : "";

  // Format metric name for display
  const displayName = metricName
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `${severityText}${displayName}${location}`;
}

/**
 * Generate bottleneck description
 */
function generateDescription(
  metricName: string,
  currentValue: number,
  targetValue: number,
  unit: string
): string {
  const ratio = ((currentValue - targetValue) / targetValue) * 100;

  return `Average ${metricName} is ${currentValue.toFixed(0)}${unit}, which is ${ratio.toFixed(0)}% above the target of ${targetValue}${unit}.`;
}

/**
 * Generate impact description
 */
function generateImpact(
  category: BottleneckCategory,
  severity: BottleneckSeverity
): string {
  const impacts = {
    [BottleneckCategory.DATABASE_QUERY]:
      "Slow database queries cause delayed data loading and poor user experience.",
    [BottleneckCategory.LARGE_BUNDLE]:
      "Large JavaScript bundles increase initial load time and may affect app installability.",
    [BottleneckCategory.SLOW_API]:
      "Slow API responses cause delayed data loading and poor user experience.",
    [BottleneckCategory.MEMORY_LEAK]:
      "Memory leaks cause performance degradation over time and may cause browser crashes.",
    [BottleneckCategory.EXCESSIVE_RENDERS]:
      "Excessive re-renders cause UI jank and sluggish interactions.",
    [BottleneckCategory.NETWORK_REQUESTS]:
      "Too many network requests increase load time and server costs.",
    [BottleneckCategory.SLOW_LCP]:
      "Slow Largest Contentful Paint indicates poor perceived performance and user experience.",
  };

  const severityPrefix =
    severity === BottleneckSeverity.CRITICAL
      ? "Critical impact: "
      : severity === BottleneckSeverity.HIGH
        ? "High impact: "
        : "";

  return severityPrefix + impacts[category];
}

/**
 * Generate optimization suggestion
 */
function generateSuggestion(
  category: BottleneckCategory,
  _metricName: string
): string {
  const suggestions = {
    [BottleneckCategory.DATABASE_QUERY]:
      "Review query execution plans, add appropriate indexes, optimize queries, and implement query result caching.",
    [BottleneckCategory.LARGE_BUNDLE]:
      "Implement dynamic imports, tree-shaking, code splitting, and consider lighter alternatives for heavy dependencies.",
    [BottleneckCategory.SLOW_API]:
      "Review API endpoint performance, implement caching, optimize database queries, and consider edge caching.",
    [BottleneckCategory.MEMORY_LEAK]:
      "Profile memory usage, check for event listener leaks, clean up subscriptions, and avoid accidental global state.",
    [BottleneckCategory.EXCESSIVE_RENDERS]:
      "Add React.memo for expensive components, implement useMemo/useCallback, and split large components.",
    [BottleneckCategory.NETWORK_REQUESTS]:
      "Implement request batching, use HTTP/2, consolidate endpoints, and add response caching.",
    [BottleneckCategory.SLOW_LCP]:
      "Optimize image loading, implement SSR for critical content, reduce JavaScript execution time, and optimize CSS delivery.",
  };

  return suggestions[category];
}

/**
 * Get default target value for a metric
 */
function getDefaultTarget(metricName: string): number {
  const defaults: Record<string, number> = {
    page_load_time: 2000,
    query_duration: 200,
    bundle_size: 200,
    api_response_time: 100,
    FCP: 1800,
    LCP: 2500,
    TTFB: 800,
    CLS: 0.1,
    FID: 100,
  };

  return defaults[metricName] ?? 1000; // Default fallback
}

/**
 * Get default unit for a metric
 */
function getDefaultUnit(metricName: string): string {
  if (
    metricName.includes("time") ||
    metricName.includes("duration") ||
    ["FCP", "LCP", "TTFB", "FID", "CLS"].includes(metricName)
  ) {
    return "ms";
  }
  if (metricName.includes("bundle") || metricName.includes("size")) {
    return "KB";
  }
  if (metricName.includes("CLS")) {
    return "score";
  }

  return "ms"; // Default fallback
}

/**
 * Categorize bottleneck severity based on current vs target value
 *
 * @param currentValue - Current measured value
 * @param targetValue - Target/threshold value
 * @returns Severity rating
 */
export function categorizeBottleneck(
  currentValue: number,
  targetValue: number
): BottleneckSeverity {
  const ratio = currentValue / targetValue;

  if (ratio > 5) return BottleneckSeverity.CRITICAL;
  if (ratio > 3) return BottleneckSeverity.HIGH;
  if (ratio > 2) return BottleneckSeverity.MEDIUM;
  return BottleneckSeverity.LOW;
}

/**
 * Generate comprehensive performance report
 *
 * @param metrics - All collected metrics
 * @param baselines - Performance baselines
 * @param timeRange - Time range for the report
 * @returns Complete performance report
 */
export function generatePerformanceReport(
  metrics: PerformanceMetric[],
  baselines: Map<
    string,
    {
      targetValue: number;
      warningThreshold: number;
      criticalThreshold: number;
      unit: string;
    }
  >,
  _timeRange: { start: Date; end: Date }
): {
  summary: {
    totalMetrics: number;
    averagePageLoadTime: number;
    slowQueriesCount: number;
    averageBundleSize: number;
    webVitals: {
      cls: number;
      fid: number;
      fcp: number;
      lcp: number;
      ttfb: number;
    };
  };
  bottlenecks: Omit<PerformanceBottleneck, "id">[];
  recommendations: string[];
} {
  // Calculate summary statistics
  const summary = {
    totalMetrics: metrics.length,
    averagePageLoadTime: calculateAverage(metrics, "page_load_time"),
    slowQueriesCount: metrics.filter(
      (m) => m.name === "query_duration" && m.value > 200
    ).length,
    averageBundleSize: calculateAverage(metrics, "bundle_size"),
    webVitals: {
      cls: calculateLatest(metrics, "CLS"),
      fid: calculateLatest(metrics, "FID"),
      fcp: calculateLatest(metrics, "FCP"),
      lcp: calculateLatest(metrics, "LCP"),
      ttfb: calculateLatest(metrics, "TTFB"),
    },
  };

  // Identify bottlenecks
  const bottlenecks = analyzeMetrics(metrics, baselines);

  // Generate recommendations
  const recommendations = generateRecommendations(summary, bottlenecks);

  return {
    summary,
    bottlenecks,
    recommendations,
  };
}

/**
 * Calculate average value for a specific metric name
 */
function calculateAverage(metrics: PerformanceMetric[], name: string): number {
  const filtered = metrics.filter((m) => m.name === name);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
}

/**
 * Get latest value for a specific metric name
 */
function calculateLatest(metrics: PerformanceMetric[], name: string): number {
  const filtered = metrics.filter((m) => m.name === name);
  if (filtered.length === 0) return 0;
  // Sort by timestamp descending and get first
  return filtered.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  )[0].value;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  summary: any,
  bottlenecks: Omit<PerformanceBottleneck, "id">[]
): string[] {
  const recommendations: string[] = [];

  // Page load time recommendations
  if (summary.averagePageLoadTime > 2000) {
    recommendations.push(
      `Page load time (${summary.averagePageLoadTime.toFixed(0)}ms) exceeds 2s target. Implement code splitting, lazy loading, and optimize critical rendering path.`
    );
  }

  // Slow query recommendations
  if (summary.slowQueriesCount > 10) {
    recommendations.push(
      `${summary.slowQueriesCount} slow queries detected (>200ms). Review database indexes and query optimization.`
    );
  }

  // Bundle size recommendations
  if (summary.averageBundleSize > 200) {
    recommendations.push(
      `Bundle size (${summary.averageBundleSize.toFixed(0)}KB) exceeds 200KB target. Implement dynamic imports and tree-shaking.`
    );
  }

  // Web Vitals recommendations
  if (summary.webVitals.lcp > 2500) {
    recommendations.push(
      `Largest Contentful Paint (${summary.webVitals.lcp.toFixed(0)}ms) is slow. Optimize image loading and consider SSR for critical content.`
    );
  }

  if (summary.webVitals.cls > 0.25) {
    recommendations.push(
      `Cumulative Layout Shift (${summary.webVitals.cls.toFixed(2)}) is high. Reserve space for dynamic content and avoid inserting content above existing content.`
    );
  }

  // Bottleneck-specific recommendations
  const criticalBottlenecks = bottlenecks.filter(
    (b) => b.severity === BottleneckSeverity.CRITICAL
  );
  if (criticalBottlenecks.length > 0) {
    recommendations.push(
      `${criticalBottlenecks.length} critical bottlenecks require immediate attention.`
    );
  }

  return recommendations;
}
