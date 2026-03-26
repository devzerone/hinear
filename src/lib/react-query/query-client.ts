import { QueryClient } from "@tanstack/react-query";

/**
 * React Query Client Configuration
 * Feature: 003-performance-audit (User Story 2: Optimization)
 *
 * Caching strategy:
 * - Project data: 5 minutes stale time
 * - Issue data: 10 minutes stale time
 * - Default: 5 minutes stale time
 */

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes by default
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Cache data for 10 minutes by default
        gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
        // Retry failed requests once
        retry: 1,
        // Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus by default (reduces server load)
        refetchOnWindowFocus: false,
        // Don't refetch on mount by default
        refetchOnMount: false,
        // Don't refetch on reconnect by default
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        // Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

/**
 * Query keys factory for consistent cache keys
 */
export const queryKeys = {
  // Project queries
  projects: {
    all: ["projects"] as const,
    lists: () => ["projects", "list"] as const,
    list: (filters?: { type?: string }) =>
      ["projects", "list", filters] as const,
    details: () => ["projects", "detail"] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    members: (projectId: string) => ["projects", projectId, "members"] as const,
    invitations: (projectId: string) =>
      ["projects", projectId, "invitations"] as const,
  },

  // Issue queries
  issues: {
    all: ["issues"] as const,
    lists: () => ["issues", "list"] as const,
    list: (projectId: string, filters?: Record<string, unknown>) =>
      ["issues", "list", projectId, filters] as const,
    details: () => ["issues", "detail"] as const,
    detail: (id: string) => ["issues", "detail", id] as const,
    comments: (issueId: string) => ["issues", issueId, "comments"] as const,
    activity: (issueId: string) => ["issues", issueId, "activity"] as const,
  },

  // Performance queries
  performance: {
    all: ["performance"] as const,
    metrics: () => ["performance", "metrics"] as const,
    report: () => ["performance", "report"] as const,
    bottlenecks: () => ["performance", "bottlenecks"] as const,
  },
};

/**
 * Query-specific cache times
 */
export const cacheTimes = {
  // Project data changes rarely - cache for 10 minutes
  project: 10 * 60 * 1000, // 10 minutes
  projectMembers: 5 * 60 * 1000, // 5 minutes
  projectInvitations: 2 * 60 * 1000, // 2 minutes

  // Issue data changes frequently - cache for 5 minutes
  issue: 5 * 60 * 1000, // 5 minutes
  issueList: 2 * 60 * 1000, // 2 minutes
  issueComments: 1 * 60 * 1000, // 1 minute
  issueActivity: 1 * 60 * 1000, // 1 minute

  // Performance data - cache for 5 minutes
  performanceMetrics: 5 * 60 * 1000, // 5 minutes
  performanceReport: 5 * 60 * 1000, // 5 minutes
};

/**
 * Stale times for automatic refetching
 */
export const staleTimes = {
  // Project data stays fresh for 10 minutes
  project: 10 * 60 * 1000, // 10 minutes
  projectMembers: 5 * 60 * 1000, // 5 minutes
  projectInvitations: 2 * 60 * 1000, // 2 minutes

  // Issue data stays fresh for 5 minutes
  issue: 5 * 60 * 1000, // 5 minutes
  issueList: 2 * 60 * 1000, // 2 minutes
  issueComments: 1 * 60 * 1000, // 1 minute
  issueActivity: 1 * 60 * 1000, // 1 minute

  // Performance data stays fresh for 5 minutes
  performanceMetrics: 5 * 60 * 1000, // 5 minutes
  performanceReport: 5 * 60 * 1000, // 5 minutes
};
