/**
 * GitHub Schema Validation Tests
 *
 * TDD Approach: Red-Green-Refactor
 */

import { describe, expect, it } from "vitest";
import {
  createGitHubBranchInputSchema,
  linkGitHubIssueInputSchema,
  linkGitHubPRInputSchema,
} from "../github.js";

describe("GitHub Schemas", () => {
  const validIssueId = "550e8400-e29b-41d4-a716-446655440000";

  describe("createGitHubBranchInputSchema", () => {
    it("should validate with issue_id only", () => {
      const result = createGitHubBranchInputSchema.safeParse({
        issue_id: validIssueId,
      });
      expect(result.success).toBe(true);
    });

    it("should validate with custom base_branch", () => {
      const result = createGitHubBranchInputSchema.safeParse({
        issue_id: validIssueId,
        base_branch: "develop",
      });
      expect(result.success).toBe(true);
    });

    it('should use "main" as default base_branch', () => {
      const result = createGitHubBranchInputSchema.safeParse({
        issue_id: validIssueId,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.base_branch).toBe("main");
      }
    });
  });

  describe("linkGitHubIssueInputSchema", () => {
    it("should validate valid GitHub issue URL", () => {
      const result = linkGitHubIssueInputSchema.safeParse({
        issue_id: validIssueId,
        github_issue_url: "https://github.com/owner/repo/issues/123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid URL format", () => {
      const result = linkGitHubIssueInputSchema.safeParse({
        issue_id: validIssueId,
        github_issue_url: "https://example.com/not-github",
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-issue URL", () => {
      const result = linkGitHubIssueInputSchema.safeParse({
        issue_id: validIssueId,
        github_issue_url: "https://github.com/owner/repo/pull/123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("linkGitHubPRInputSchema", () => {
    it("should validate valid GitHub PR URL", () => {
      const result = linkGitHubPRInputSchema.safeParse({
        issue_id: validIssueId,
        github_pr_url: "https://github.com/owner/repo/pull/456",
      });
      expect(result.success).toBe(true);
    });

    it("should accept auto_merge flag", () => {
      const result = linkGitHubPRInputSchema.safeParse({
        issue_id: validIssueId,
        github_pr_url: "https://github.com/owner/repo/pull/456",
        auto_merge: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.auto_merge).toBe(true);
      }
    });

    it("should default auto_merge to false", () => {
      const result = linkGitHubPRInputSchema.safeParse({
        issue_id: validIssueId,
        github_pr_url: "https://github.com/owner/repo/pull/456",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.auto_merge).toBe(false);
      }
    });

    it("should reject non-PR URL", () => {
      const result = linkGitHubPRInputSchema.safeParse({
        issue_id: validIssueId,
        github_pr_url: "https://github.com/owner/repo/issues/123",
      });
      expect(result.success).toBe(false);
    });
  });
});
