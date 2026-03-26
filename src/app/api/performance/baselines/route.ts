// Performance Baselines API Route
// Feature: 003-performance-audit

import { type NextRequest, NextResponse } from "next/server";
import {
  getAllBaselines,
  initializeDefaultBaselines,
  setBaseline,
} from "@/features/performance/actions/set-baseline-action";
import type { CreateBaselineInput } from "@/features/performance/types";

/**
 * POST /api/performance/baselines
 *
 * Set a performance baseline
 *
 * Body:
 * {
 *   "metricName": "page_load_time",
 *   "route": "/projects/[id]",
 *   "targetValue": 2000,
 *   "warningThreshold": 3000,
 *   "criticalThreshold": 4000,
 *   "unit": "ms"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.metricName ||
      typeof body.targetValue !== "number" ||
      typeof body.warningThreshold !== "number" ||
      typeof body.criticalThreshold !== "number" ||
      !body.unit
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: metricName, targetValue, warningThreshold, criticalThreshold, unit",
        },
        { status: 400 }
      );
    }

    const input: CreateBaselineInput = {
      metricName: body.metricName,
      route: body.route,
      targetValue: body.targetValue,
      warningThreshold: body.warningThreshold,
      criticalThreshold: body.criticalThreshold,
      unit: body.unit,
    };

    await setBaseline(input);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/performance/baselines] Error:", error);
    return NextResponse.json(
      { error: "Failed to set baseline" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/performance/baselines
 *
 * Get all performance baselines
 */
export async function GET() {
  try {
    const baselines = await getAllBaselines();

    return NextResponse.json({ baselines });
  } catch (error) {
    console.error("[GET /api/performance/baselines] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch baselines" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/performance/baselines/initialize
 *
 * Initialize default performance baselines
 */
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.pathname.split("/").pop();

    if (action === "initialize") {
      await initializeDefaultBaselines();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[PUT /api/performance/baselines] Error:", error);
    return NextResponse.json(
      { error: "Failed to initialize baselines" },
      { status: 500 }
    );
  }
}
