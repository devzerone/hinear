import { describe, expect, it } from "vitest";

import { buildIssueDrawerUrl } from "@/features/issues/lib/issue-drawer-url";

describe("buildIssueDrawerUrl", () => {
  it("adds issueId while preserving existing filters", () => {
    expect(
      buildIssueDrawerUrl(
        "/projects/project-1",
        "search=bug&statuses=Todo",
        "issue-1"
      )
    ).toBe("/projects/project-1?search=bug&statuses=Todo&issueId=issue-1");
  });

  it("removes issueId while preserving the remaining params", () => {
    expect(
      buildIssueDrawerUrl(
        "/projects/project-1",
        "search=bug&issueId=issue-1&labelIds=label-1",
        null
      )
    ).toBe("/projects/project-1?search=bug&labelIds=label-1");
  });
});
