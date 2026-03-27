// Query Tracker - Database query performance monitoring wrapper
// Feature: 003-performance-audit

/**
 * Wraps a database query function with performance tracking
 *
 * Usage:
 * ```typescript
 * const data = await trackQuery("getProject", async () => {
 *   const { data, error } = await supabase
 *     .from('projects')
 *     .select('*')
 *     .eq('id', id)
 *     .single();
 *   if (error) throw error;
 *   return data;
 * });
 * ```
 *
 * @param queryName - Descriptive name for the query
 * @param queryFn - Async function that executes the query
 * @returns Promise with the query result
 */
export async function trackQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  return queryFn().then(
    (result) => {
      const duration = performance.now() - start;

      // Log slow queries (>200ms)
      if (duration > 200) {
        console.warn(`[Slow Query] ${queryName}: ${duration.toFixed(2)}ms`);
      }

      // Record metric (fire and forget)
      if (typeof window !== "undefined") {
        fetch("/api/performance/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "query_duration",
            value: duration,
            unit: "ms",
            metadata: {
              queryName,
              slow: duration > 200,
            },
          }),
        }).catch(() => {
          // Silently fail - don't let metric recording break the app
        });
      }

      return result;
    },
    (error) => {
      const duration = performance.now() - start;
      console.error(
        `[Query Error] ${queryName}: ${duration.toFixed(2)}ms`,
        error
      );
      throw error;
    }
  );
}

/**
 * Wraps a Supabase query builder with performance tracking
 *
 * Usage:
 * ```typescript
 * const data = await trackSupabaseQuery(
 *   "getProjectById",
 *   supabase.from('projects').select('*').eq('id', id).single()
 * );
 * ```
 *
 * @param queryName - Descriptive name for the query
 * @param query - Supabase query builder
 * @returns Promise with the query result
 */
export async function trackSupabaseQuery<T>(
  queryName: string,
  query: Promise<{ data: T | null; error: any }>
): Promise<T> {
  return trackQuery(queryName, async () => {
    const { data, error } = await query;
    if (error) throw error;
    if (data === null) throw new Error(`${queryName} returned null`);
    return data;
  });
}
