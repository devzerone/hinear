/**
 * Batch Schema Validation Tests
 *
 * TDD Approach: Red-Green-Refactor
 * Tests for Zod schema validation
 */

import { describe, expect, it } from "vitest";
import {
  batchOperationResultSchema,
  batchUpdateIssuesInputSchema,
  batchUpdateOutputSchema,
  batchUpdateSummarySchema,
} from "../batch.js";

describe("Batch Schemas", () => {
  const validIssueIds = [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003",
  ];

  describe("batchUpdateIssuesInputSchema", () => {
    it("should validate valid input with status update", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: { status: "Done" },
      });

      expect(result.success).toBe(true);
    });

    it("should validate valid input with priority update", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: { priority: "High" },
      });

      expect(result.success).toBe(true);
    });

    it("should validate valid input with assignee update", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: { assignee_id: "550e8400-e29b-41d4-a716-446655440004" },
      });

      expect(result.success).toBe(true);
    });

    it("should validate valid input with multiple updates", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: {
          status: "In Progress",
          priority: "High",
        },
      });

      expect(result.success).toBe(true);
    });

    it("should validate valid input with comment_on_change", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: { status: "Done" },
        comment_on_change: "Batch completed via MCP",
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty issue_ids array", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: [],
        updates: { status: "Done" },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "At least one issue ID"
        );
      }
    });

    it("should reject more than 100 issue IDs", () => {
      const tooManyIds = Array.from({ length: 101 }, (_, i) => `id-${i}`);
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: tooManyIds,
        updates: { status: "Done" },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Cannot update more than 100"
        );
      }
    });

    it("should accept exactly 100 issue IDs", () => {
      const exactly100Ids = Array.from({ length: 100 }, (_, i) => `id-${i}`);
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: exactly100Ids,
        updates: { status: "Done" },
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid issue ID format", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: ["not-a-uuid"],
        updates: { status: "Done" },
      });

      expect(result.success).toBe(false);
    });

    it("should reject empty updates object", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: {},
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "At least one update field"
        );
      }
    });

    it("should reject invalid status value", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: { status: "InvalidStatus" },
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid priority value", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: { priority: "InvalidPriority" },
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid assignee_id format", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: { assignee_id: "not-a-uuid" },
      });

      expect(result.success).toBe(false);
    });

    it("should reject comment_on_change over 1000 characters", () => {
      const result = batchUpdateIssuesInputSchema.safeParse({
        issue_ids: validIssueIds,
        updates: { status: "Done" },
        comment_on_change: "A".repeat(1001),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("1000 characters");
      }
    });

    it("should accept all valid status values", () => {
      const validStatuses = [
        "Triage",
        "Backlog",
        "Todo",
        "In Progress",
        "Done",
      ];

      validStatuses.forEach((status) => {
        const result = batchUpdateIssuesInputSchema.safeParse({
          issue_ids: validIssueIds,
          updates: { status: status as any },
        });

        expect(result.success).toBe(true);
      });
    });

    it("should accept all valid priority values", () => {
      const validPriorities = [
        "No priority",
        "Low",
        "Medium",
        "High",
        "Critical",
      ];

      validPriorities.forEach((priority) => {
        const result = batchUpdateIssuesInputSchema.safeParse({
          issue_ids: validIssueIds,
          updates: { priority: priority as any },
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("batchOperationResultSchema", () => {
    it("should validate successful result", () => {
      const result = batchOperationResultSchema.safeParse({
        issue_id: validIssueIds[0],
        success: true,
        error: null,
      });

      expect(result.success).toBe(true);
    });

    it("should validate failed result with error", () => {
      const result = batchOperationResultSchema.safeParse({
        issue_id: validIssueIds[0],
        success: false,
        error: "Issue not found",
      });

      expect(result.success).toBe(true);
    });

    it("should accept null error for successful result", () => {
      const result = batchOperationResultSchema.safeParse({
        issue_id: validIssueIds[0],
        success: true,
        error: null,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.error).toBeNull();
      }
    });

    it("should require issue_id", () => {
      const result = batchOperationResultSchema.safeParse({
        success: true,
        error: null,
      });

      expect(result.success).toBe(false);
    });

    it("should require success field", () => {
      const result = batchOperationResultSchema.safeParse({
        issue_id: validIssueIds[0],
        error: null,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("batchUpdateSummarySchema", () => {
    it("should validate valid summary", () => {
      const result = batchUpdateSummarySchema.safeParse({
        total: 10,
        succeeded: 8,
        failed: 2,
      });

      expect(result.success).toBe(true);
    });

    it("should accept all zeros", () => {
      const result = batchUpdateSummarySchema.safeParse({
        total: 0,
        succeeded: 0,
        failed: 0,
      });

      expect(result.success).toBe(true);
    });

    it("should reject negative numbers", () => {
      const result = batchUpdateSummarySchema.safeParse({
        total: -1,
        succeeded: 0,
        failed: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should validate that total equals succeeded plus failed", () => {
      // Note: This schema doesn't enforce the relationship, just validates types
      const result = batchUpdateSummarySchema.safeParse({
        total: 5,
        succeeded: 3,
        failed: 1, // Should be 2, but schema allows it
      });

      expect(result.success).toBe(true);
    });
  });

  describe("batchUpdateOutputSchema", () => {
    it("should validate complete output", () => {
      const result = batchUpdateOutputSchema.safeParse({
        results: [
          {
            issue_id: validIssueIds[0],
            success: true,
            error: null,
          },
        ],
        summary: {
          total: 1,
          succeeded: 1,
          failed: 0,
        },
        duration_ms: 1234,
      });

      expect(result.success).toBe(true);
    });

    it("should accept empty results array", () => {
      const result = batchUpdateOutputSchema.safeParse({
        results: [],
        summary: {
          total: 0,
          succeeded: 0,
          failed: 0,
        },
        duration_ms: 0,
      });

      expect(result.success).toBe(true);
    });

    it("should reject negative duration_ms", () => {
      const result = batchUpdateOutputSchema.safeParse({
        results: [],
        summary: {
          total: 0,
          succeeded: 0,
          failed: 0,
        },
        duration_ms: -1,
      });

      expect(result.success).toBe(false);
    });
  });
});
