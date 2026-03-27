// Performance Report API Route
// Feature: 003-performance-audit

import { type NextRequest, NextResponse } from "next/server";
import { getPerformanceReport } from "@/features/performance/actions/get-performance-report-action";
import type { Environment } from "@/features/performance/contracts";
import type { PerformanceReportQuery } from "@/features/performance/types";

/**
 * GET /api/performance/report
 *
 * Generate a performance report
 *
 * Query params:
 * - start: Start timestamp (ISO string)
 * - end: End timestamp (ISO string)
 * - routes: Comma-separated list of routes (optional)
 * - environments: Comma-separated list of environments (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const routesParam = searchParams.get("routes");
    const environmentsParam = searchParams.get("environments");

    // Validate required params
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

    const routes = routesParam ? routesParam.split(",") : undefined;
    const environments = environmentsParam
      ? (environmentsParam.split(",") as Environment[])
      : undefined;

    const query: PerformanceReportQuery = {
      timeRange,
      routes,
      environments,
    };

    const report = await getPerformanceReport(query);

    return NextResponse.json(report);
  } catch (error) {
    console.error("[GET /api/performance/report] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate performance report" },
      { status: 500 }
    );
  }
}
