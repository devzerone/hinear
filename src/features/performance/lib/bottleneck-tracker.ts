// Bottleneck Tracker
// Feature: 003-performance-audit (User Story 3: Monitoring)

/**
 * Bottleneck Tracker for performance issues
 *
 * Identifies, tracks, and manages performance bottlenecks throughout their lifecycle.
 */

import type { BottleneckCategory, BottleneckSeverity } from "../contracts";
import { performanceMetricsRepository } from "../repositories/performance-metrics-repository";
import type {
  BottleneckStatus,
  PerformanceBottleneck,
  PerformanceMetric,
} from "../types";
import { analyzeMetrics } from "./analyzer";
import { baselineManager } from "./baseline-manager";

export class BottleneckTracker {
  /**
   * Identify bottlenecks by comparing metrics to baselines
   */
  async identifyBottlenecks(
    metrics: PerformanceMetric[],
    baselines?: Map<string, { targetValue: number; unit: string }>
  ): Promise<Omit<PerformanceBottleneck, "id">[]> {
    // Use provided baselines or fetch from baseline manager
    if (!baselines) {
      const allBaselines = await baselineManager.getAllBaselines();
      baselines = new Map(
        allBaselines.map((b) => [
          b.metricName,
          { targetValue: b.targetValue, unit: b.unit },
        ])
      );
    }

    // Use analyzer to identify bottlenecks
    return analyzeMetrics(metrics, baselines);
  }

  /**
   * Update bottleneck status
   */
  async updateStatus(
    bottleneckId: string,
    status: BottleneckStatus
  ): Promise<void> {
    // TODO: Implement updateBottleneckStatus in repository
    // await performanceMetricsRepository.updateBottleneckStatus(
    //   bottleneckId,
    //   status
    // );

    console.log(
      `[BottleneckTracker] Would update bottleneck ${bottleneckId} to ${status}`
    );
  }

  /**
   * Get bottlenecks with optional filters
   */
  async getBottlenecks(filters?: {
    category?: BottleneckCategory;
    severity?: BottleneckSeverity;
    status?: BottleneckStatus;
  }): Promise<PerformanceBottleneck[]> {
    const bottlenecks =
      await performanceMetricsRepository.listBottlenecks(filters);
    return bottlenecks as any;
  }

  /**
   * Get a specific bottleneck by ID
   */
  async getBottleneck(
    bottleneckId: string
  ): Promise<PerformanceBottleneck | null> {
    // TODO: Implement getBottleneckById in repository
    const bottlenecks = await performanceMetricsRepository.listBottlenecks();
    return (bottlenecks.find((b: any) => b.id === bottleneckId) || null) as any;
  }

  /**
   * Record an optimization for a bottleneck
   */
  async recordOptimization(
    bottleneckId: string,
    optimization: {
      title: string;
      description: string;
      beforeValue: number;
      afterValue: number;
      implementation: string;
    }
  ): Promise<void> {
    const improvementPercentage =
      ((optimization.beforeValue - optimization.afterValue) /
        optimization.beforeValue) *
      100;

    await performanceMetricsRepository.saveOptimizationRecord({
      bottleneckId,
      action: optimization.title,
      impact: optimization.description || "",
      appliedAt: new Date(),
      result: `Improved from ${optimization.beforeValue} to ${optimization.afterValue}`,
    });

    console.log(
      `[BottleneckTracker] Recorded optimization for bottleneck ${bottleneckId}`
    );
  }

  /**
   * Get active bottlenecks (not resolved)
   */
  async getActiveBottlenecks(): Promise<PerformanceBottleneck[]> {
    return this.getBottlenecks({ status: "IDENTIFIED" });
  }

  /**
   * Get bottlenecks by severity
   */
  async getBottlenecksBySeverity(
    severity: BottleneckSeverity
  ): Promise<PerformanceBottleneck[]> {
    return this.getBottlenecks({ severity });
  }

  /**
   * Get bottlenecks by category
   */
  async getBottlenecksByCategory(
    category: BottleneckCategory
  ): Promise<PerformanceBottleneck[]> {
    return this.getBottlenecks({ category });
  }

  /**
   * Auto-identify bottlenecks from recent metrics
   */
  async scanForBottlenecks(
    timeRange: { start: Date; end: Date },
    options?: {
      route?: string;
      environment?: string;
    }
  ): Promise<PerformanceBottleneck[]> {
    // Fetch recent metrics
    const metrics = await performanceMetricsRepository.getMetricsByTimeRange(
      timeRange,
      options
    );

    // Identify bottlenecks
    const newBottlenecks = await this.identifyBottlenecks(metrics);

    // Save new bottlenecks
    for (const bottleneck of newBottlenecks) {
      await performanceMetricsRepository.saveBottleneck(bottleneck);
    }

    console.log(
      `[BottleneckTracker] Scanned ${metrics.length} metrics and identified ${newBottlenecks.length} bottlenecks`
    );

    return newBottlenecks;
  }

  /**
   * Get bottleneck statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<BottleneckStatus, number>;
    bySeverity: Record<BottleneckSeverity, number>;
    byCategory: Record<BottleneckCategory, number>;
  }> {
    const allBottlenecks = await this.getBottlenecks();

    const byStatus: Record<BottleneckStatus, number> = {
      IDENTIFIED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };

    const bySeverity: Record<BottleneckSeverity, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    const byCategory: Record<BottleneckCategory, number> = {
      Database: 0,
      Network: 0,
      Rendering: 0,
      Bundle: 0,
      Memory: 0,
      CPU: 0,
      Other: 0,
    };

    for (const bottleneck of allBottlenecks) {
      byStatus[bottleneck.status]++;
      bySeverity[bottleneck.severity]++;
      byCategory[bottleneck.category]++;
    }

    return {
      total: allBottlenecks.length,
      byStatus,
      bySeverity,
      byCategory,
    };
  }
}

// Export singleton instance
export const bottleneckTracker = new BottleneckTracker();
