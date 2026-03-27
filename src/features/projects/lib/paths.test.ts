import { describe, expect, it } from "vitest";

import {
  getIssuePath,
  getProjectIssueCreatePath,
  getProjectOverviewPath,
  getProjectPath,
  getProjectSettingsPath,
} from "@/features/projects/lib/project-routes";

describe("project paths", () => {
  it("builds the canonical project routes", () => {
    expect(getProjectPath("project-1")).toBe("/projects/project-1");
    expect(getProjectOverviewPath("project-1")).toBe(
      "/projects/project-1/overview"
    );
    expect(getProjectSettingsPath("project-1")).toBe(
      "/projects/project-1/settings"
    );
    expect(getProjectIssueCreatePath("project-1")).toBe(
      "/projects/project-1/issues/new"
    );
    expect(getIssuePath("project-1", "issue-9")).toBe(
      "/projects/project-1?issueId=issue-9"
    );
  });
});
