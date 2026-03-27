// Web Vitals Component
// Feature: 003-performance-audit

"use client";

import { useEffect } from "react";

/**
 * WebVitals component - Collects and reports Web Vitals metrics
 *
 * This component automatically collects Core Web Vitals metrics:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * Usage:
 * ```tsx
 * import { WebVitals } from "@/components/WebVitals";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitals />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function WebVitals() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Only collect in production or when explicitly enabled
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === "true"
    ) {
      loadWebVitals();
    }
  }, []);

  return null;
}

/**
 * Load and initialize Web Vitals reporting
 */
async function loadWebVitals() {
  try {
    // Dynamic import to avoid SSR issues
    const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import("web-vitals");

    // Report each metric
    onCLS(reportWebVital);
    onINP(reportWebVital); // onFID was replaced with onINP in web-vitals@3
    onFCP(reportWebVital);
    onLCP(reportWebVital);
    onTTFB(reportWebVital);
  } catch (error) {
    console.error("[WebVitals] Failed to load web-vitals:", error);
  }
}

/**
 * Report a Web Vitals metric to the performance API
 */
function reportWebVital(metric: {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
}) {
  // Log in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("[WebVitals]", metric.name, metric.value, metric.rating);
  }

  // Send to performance API (fire and forget)
  fetch("/api/performance/metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      unit: "ms",
      metadata: {
        id: metric.id,
        rating: metric.rating,
        delta: metric.delta,
        userAgent: navigator.userAgent,
      },
    }),
  }).catch((error) => {
    // Silently fail - don't let metric reporting break the app
    if (process.env.NODE_ENV === "development") {
      console.error("[WebVitals] Failed to report metric:", error);
    }
  });
}

/**
 * HOC to add Web Vitals to any component
 *
 * Usage:
 * ```tsx
 * const MyPageWithWebVitals = withWebVitals(MyPage);
 * ```
 */
export function withWebVitals<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithWebVitals(props: P) {
    return (
      <>
        <WebVitals />
        <Component {...props} />
      </>
    );
  };
}
