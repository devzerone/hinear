/**
 * Batch Adapter Unit Tests
 *
 * TDD Approach: Red-Green-Refactor
 * 1. Red: Write failing tests
 * 2. Green: Implement minimal code to pass tests
 * 3. Refactor: Improve code quality
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { batchUpdateIssues } from "../batch.js";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

// Mock dependencies
vi.mock("../../lib/auth.js", () => ({
  resolveSession: vi.fn(() => ({
    userId: "mock-user-id",
    accessToken: null,
  })),
}));

vi.mock("../../lib/supabase.js", () => ({
  createMcpActorSupabaseClient: vi.fn(() => mockSupabase),
}));

describe("Batch Adapter", () => {
  const mockIssueIds = [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003",
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("batchUpdateIssues", () => {
    it("should successfully update multiple issues", async () => {
      // Mock successful updates for all issues
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { id: mockIssueIds[0], status: "Done" },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ update: mockUpdate });
      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: mockEq as any,
      } as any);

      const result = await batchUpdateIssues({
        issue_ids: mockIssueIds,
        updates: { status: "Done" },
      });

      expect(result.summary.total).toBe(3);
      expect(result.summary.succeeded).toBe(3);
      expect(result.summary.failed).toBe(0);
      expect(result.results).toHaveLength(3);
      expect(result.results.every((r) => r.success)).toBe(true);
    });

    it("should handle partial failures", async () => {
      let callCount = 0;
      const mockUpdate = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.resolve({
            data: null,
            error: { message: "Issue not found" },
          });
        }
        return Promise.resolve({
          data: { id: mockIssueIds[callCount - 1], status: "Done" },
          error: null,
        });
      });
      const mockEq = vi.fn().mockReturnValue({ update: mockUpdate });
      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: mockEq as any,
      } as any);

      const result = await batchUpdateIssues({
        issue_ids: mockIssueIds,
        updates: { status: "Done" },
      });

      expect(result.summary.total).toBe(3);
      expect(result.summary.succeeded).toBe(2);
      expect(result.summary.failed).toBe(1);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toBeTruthy();
    });

    it("should add comment when comment_on_change is provided", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { id: mockIssueIds[0], status: "Done" },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ update: mockUpdate });
      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: mockEq as any,
      } as any);

      await batchUpdateIssues({
        issue_ids: mockIssueIds,
        updates: { status: "Done" },
        comment_on_change: "Batch completed",
      });

      // Verify update was called
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should update multiple fields at once", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { id: mockIssueIds[0], status: "In Progress", priority: "High" },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ update: mockUpdate });
      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: mockEq as any,
      } as any);

      const result = await batchUpdateIssues({
        issue_ids: [mockIssueIds[0]],
        updates: {
          status: "In Progress",
          priority: "High",
        },
      });

      expect(result.summary.succeeded).toBe(1);
    });

    it("should reject more than 100 issues", async () => {
      const tooManyIssueIds = Array.from({ length: 101 }, (_, i) => `id-${i}`);

      await expect(
        batchUpdateIssues({
          issue_ids: tooManyIssueIds,
          updates: { status: "Done" },
        })
      ).rejects.toThrow();
    });

    it("should require at least one update field", async () => {
      await expect(
        batchUpdateIssues({
          issue_ids: mockIssueIds,
          updates: {},
        })
      ).rejects.toThrow();
    });

    it("should return duration in milliseconds", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { id: mockIssueIds[0], status: "Done" },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ update: mockUpdate });
      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: mockEq as any,
      } as any);

      const result = await batchUpdateIssues({
        issue_ids: [mockIssueIds[0]],
        updates: { status: "Done" },
      });

      expect(result.duration_ms).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration_ms).toBe("number");
    });
  });
});
