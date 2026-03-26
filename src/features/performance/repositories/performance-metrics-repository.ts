import { createClient } from "@/lib/supabase/server-client";

// Types
export interface Bottleneck {
  id: string;
  title: string;
  category: string;
  severity: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  impact: string;
  suggestion: string;
  status: string;
  identifiedAt: Date;
  resolvedAt: Date | null;
  location?: string;
  description?: string;
}

export interface PerformanceBaseline {
  id: string;
  metricName: string;
  route: string | null;
  currentValue: number;
  thresholdType: "warning" | "critical";
  thresholdValue: number;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  updatedAt: Date;
}

export interface OptimizationRecord {
  id: string;
  bottleneckId: string;
  action: string;
  impact: string;
  appliedAt: Date;
  result: string;
}

// Repository class
export class PerformanceMetricsRepository {
  private supabase = createClient();

  async recordBottleneck(
    bottleneck: Omit<Bottleneck, "id">
  ): Promise<Bottleneck> {
    const { data, error } = await this.supabase
      .from("performance_bottlenecks")
      .insert({
        title: bottleneck.title,
        category: bottleneck.category,
        severity: bottleneck.severity,
        current_value: bottleneck.currentValue,
        target_value: bottleneck.targetValue,
        unit: bottleneck.unit,
        impact: bottleneck.impact,
        suggestion: bottleneck.suggestion,
        status: bottleneck.status,
        identified_at: bottleneck.identifiedAt.toISOString(),
        resolved_at: bottleneck.resolvedAt?.toISOString(),
        location: bottleneck.location,
        description: bottleneck.description,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "[PerformanceRepository] Error recording bottleneck:",
        error
      );
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      severity: data.severity,
      currentValue: Number(data.current_value),
      targetValue: Number(data.target_value),
      unit: data.unit,
      impact: data.impact,
      suggestion: data.suggestion,
      status: data.status,
      identifiedAt: new Date(data.identified_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : null,
      location: data.location,
      description: data.description,
    };
  }

  async saveBottleneck(
    bottleneck: Omit<Bottleneck, "id">
  ): Promise<Bottleneck> {
    return this.recordBottleneck(bottleneck);
  }

  async getMetricsByTimeRange(
    startTime: Date,
    endTime: Date
  ): Promise<PerformanceMetric[]> {
    const { data, error } = await this.supabase
      .from("performance_metrics")
      .select("*")
      .gte("timestamp", startTime.toISOString())
      .lte("timestamp", endTime.toISOString())
      .order("timestamp", { ascending: true });

    if (error) {
      console.error(
        "[PerformanceRepository] Error fetching metrics by time range:",
        error
      );
      throw error;
    }

    return data.map((m) => ({
      id: m.id,
      name: m.name,
      value: Number(m.value),
      unit: m.unit,
      timestamp: new Date(m.timestamp),
      route: m.route,
      environment: m.environment,
      metadata: m.metadata,
    }));
  }

  async listBottlenecks(filters?: {
    category?: string;
    severity?: string;
    status?: string;
  }): Promise<Bottleneck[]> {
    let query = this.supabase
      .from("performance_bottlenecks")
      .select("*")
      .order("identified_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.severity) {
      query = query.eq("severity", filters.severity);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "[PerformanceRepository] Error fetching bottlenecks:",
        error
      );
      throw error;
    }

    return data.map((b) => ({
      id: b.id,
      title: b.title,
      category: b.category,
      severity: b.severity,
      currentValue: Number(b.current_value),
      targetValue: Number(b.target_value),
      unit: b.unit,
      impact: b.impact,
      suggestion: b.suggestion,
      status: b.status,
      identifiedAt: new Date(b.identified_at),
      resolvedAt: b.resolved_at ? new Date(b.resolved_at) : null,
    }));
  }

  async getBaselines(): Promise<PerformanceBaseline[]> {
    const { data, error } = await this.supabase
      .from("performance_baselines")
      .select("*")
      .order("metric_name");

    if (error) {
      console.error("[PerformanceRepository] Error fetching baselines:", error);
      throw error;
    }

    return data.map((b) => ({
      id: b.id,
      metricName: b.metric_name,
      route: b.route,
      currentValue: Number(b.current_value),
      thresholdType: b.threshold_type,
      thresholdValue: Number(b.threshold_value),
      targetValue: Number(b.target_value),
      updatedAt: new Date(b.updated_at),
    }));
  }

  async saveBaseline(
    baseline: Omit<PerformanceBaseline, "id" | "updatedAt">
  ): Promise<PerformanceBaseline> {
    const { data, error } = await this.supabase
      .from("performance_baselines")
      .upsert({
        metric_name: baseline.metricName,
        route: baseline.route,
        current_value: baseline.currentValue,
        threshold_type: baseline.thresholdType,
        threshold_value: baseline.thresholdValue,
        target_value: baseline.targetValue,
      })
      .select()
      .single();

    if (error) {
      console.error("[PerformanceRepository] Error saving baseline:", error);
      throw error;
    }

    return {
      id: data.id,
      metricName: data.metric_name,
      route: data.route,
      currentValue: Number(data.current_value),
      thresholdType: data.threshold_type,
      thresholdValue: Number(data.threshold_value),
      targetValue: Number(data.target_value),
      updatedAt: new Date(data.updated_at),
    };
  }

  async saveOptimizationRecord(
    record: Omit<OptimizationRecord, "id">
  ): Promise<OptimizationRecord> {
    const { data, error } = await this.supabase
      .from("optimization_records")
      .insert({
        bottleneck_id: record.bottleneckId,
        action: record.action,
        impact: record.impact,
        applied_at: record.appliedAt.toISOString(),
        result: record.result,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "[PerformanceRepository] Error saving optimization record:",
        error
      );
      throw error;
    }

    return {
      id: data.id,
      bottleneckId: data.bottleneck_id,
      action: data.action,
      impact: data.impact,
      appliedAt: new Date(data.applied_at),
      result: data.result,
    };
  }

  async getOptimizationRecords(
    bottleneckId: string
  ): Promise<OptimizationRecord[]> {
    const { data, error } = await this.supabase
      .from("optimization_records")
      .select("*")
      .eq("bottleneck_id", bottleneckId)
      .order("applied_at", { ascending: false });

    if (error) {
      console.error(
        "[PerformanceRepository] Error fetching optimization records:",
        error
      );
      throw error;
    }

    return data.map((r) => ({
      id: r.id,
      bottleneckId: r.bottleneck_id,
      action: r.action,
      impact: r.impact,
      appliedAt: new Date(r.applied_at),
      result: r.result,
    }));
  }
}

// Singleton instance
export const performanceMetricsRepository = new PerformanceMetricsRepository();
