// Performance Metrics API Route
// Feature: 003-performance-audit

import { type NextRequest, NextResponse } from "next/server";
import { recordMetric } from "@/features/performance/actions/record-metric-action";
import type { RecordMetricInput } from "@/features/performance/types";

/**
 * POST /api/performance/metrics
 *
 * Record a performance metric
 *
 * Body:
 * {
 *   "name": "page_load_time",
 *   "value": 1500,
 *   "unit": "ms",
 *   "route": "/projects/[id]",
 *   "metadata": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.value !== "number" || !body.unit) {
      return NextResponse.json(
        { error: "Missing required fields: name, value, unit" },
        { status: 400 }
      );
    }

    const input: RecordMetricInput = {
      name: body.name,
      value: body.value,
      unit: body.unit,
      timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
      route: body.route,
      environment: body.environment,
      metadata: body.metadata,
    };

    await recordMetric(input);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/performance/metrics] Error:", error);
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/performance/metrics
 *
 * Get metrics (for debugging/admin purposes)
 *
 * Query params:
 * - name: Filter by metric name
 * - route: Filter by route
 * - start: Start timestamp (ISO string)
 * - end: End timestamp (ISO string)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const route = searchParams.get("route");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // Validate time range
    if (!start || !end) {
      return NextResponse.json(
        { error: "Missing required query params: start, end" },
        { status: 400 }
      );
    }

    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };

    // For now, return a placeholder response
    // In a real implementation, you would fetch from the repository
    return NextResponse.json({
      metrics: [],
      timeRange,
      filters: { name, route },
    });
  } catch (error) {
    console.error("[GET /api/performance/metrics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
