"use client";

import { usePerformanceProfiler } from "@/features/performance/hooks/usePerformanceProfiler";

export function PerformanceProfilerMount() {
  usePerformanceProfiler(process.env.NODE_ENV === "production");

  return null;
}
