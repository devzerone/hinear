/**
 * GitHub Client Utility Tests
 *
 * TDD Approach: Red-Green-Refactor
 */

import { describe, expect, it } from "vitest";
import { GitHubClient } from "../github-client.js";

describe("GitHub Client", () => {
  describe("URL Parsing", () => {
    it("should parse repo full name from issue URL", () => {
      const url = "https://github.com/owner/repo/issues/123";
      const repo = GitHubClient.parseRepoFullName(url);
      expect(repo).toBe("owner/repo");
    });

    it("should parse repo full name from PR URL", () => {
      const url = "https://github.com/owner/repo/pull/456";
      const repo = GitHubClient.parseRepoFullName(url);
      expect(repo).toBe("owner/repo");
    });

    it("should parse issue number", () => {
      const url = "https://github.com/owner/repo/issues/123";
      const number = GitHubClient.parseIssueNumber(url);
      expect(number).toBe(123);
    });

    it("should parse PR number", () => {
      const url = "https://github.com/owner/repo/pull/456";
      const number = GitHubClient.parsePRNumber(url);
      expect(number).toBe(456);
    });

    it("should return null for invalid URLs", () => {
      const invalidUrl = "https://example.com/not-github";
      expect(GitHubClient.parseRepoFullName(invalidUrl)).toBeNull();
    });
  });
});
