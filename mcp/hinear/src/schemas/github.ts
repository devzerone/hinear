import { z } from "zod";

// Create GitHub Branch Input Schema
export const createGitHubBranchInputSchema = z.object({
  issue_id: z.string().uuid("Invalid issue ID format"),
  base_branch: z.string().min(1, "Base branch is required").default("main"),
});

// Link GitHub Issue Input Schema
export const linkGitHubIssueInputSchema = z.object({
  issue_id: z.string().uuid("Invalid issue ID format"),
  github_issue_url: z
    .string()
    .url("Invalid GitHub issue URL")
    .regex(
      /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/,
      "Invalid GitHub issue URL format"
    ),
});

// Link GitHub PR Input Schema
export const linkGitHubPRInputSchema = z.object({
  issue_id: z.string().uuid("Invalid issue ID format"),
  github_pr_url: z
    .string()
    .url("Invalid GitHub PR URL")
    .regex(
      /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/,
      "Invalid GitHub PR URL format"
    ),
  auto_merge: z.boolean().default(false),
});

// GitHub Branch Output Schema
export const gitHubBranchSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  issue_id: z.string().uuid(),
  issue_identifier: z.string(),
});

// GitHub Issue Link Output Schema
export const gitHubIssueLinkSchema = z.object({
  id: z.string().uuid(),
  issue_id: z.string().uuid(),
  github_issue_id: z.number().int().positive(),
  github_issue_url: z.string().url(),
  github_repo_full_name: z.string(),
  synced_at: z.string().datetime(),
});

// GitHub PR Link Output Schema
export const gitHubPRLinkSchema = z.object({
  id: z.string().uuid(),
  issue_id: z.string().uuid(),
  github_pr_number: z.number().int().positive(),
  github_pr_url: z.string().url(),
  github_repo_full_name: z.string(),
  auto_merge: z.boolean(),
  synced_at: z.string().datetime(),
});

// Types
export type CreateGitHubBranchInput = z.infer<
  typeof createGitHubBranchInputSchema
>;
export type LinkGitHubIssueInput = z.infer<typeof linkGitHubIssueInputSchema>;
export type LinkGitHubPRInput = z.infer<typeof linkGitHubPRInputSchema>;
export type GitHubBranch = z.infer<typeof gitHubBranchSchema>;
export type GitHubIssueLink = z.infer<typeof gitHubIssueLinkSchema>;
export type GitHubPRLink = z.infer<typeof gitHubPRLinkSchema>;
