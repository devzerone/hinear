import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteIssue: vi.fn(),
  getIssueById: vi.fn(),
  repositoryFactory: vi.fn(),
  requireApiActorId: vi.fn(),
  requireProjectAccess: vi.fn(),
  updateIssue: vi.fn(),
}));

vi.mock("@/app/api/_lib/auth", () => ({
  requireApiActorId: mocks.requireApiActorId,
  requireProjectAccess: mocks.requireProjectAccess,
}));

vi.mock("@/features/issues/repositories/server-issues-repository", () => ({
  getServerIssuesRepository: mocks.repositoryFactory,
}));

import {
  DELETE,
  GET,
  PATCH,
} from "@/app/api/v1/projects/[projectId]/issues/[issueId]/route";
import { createRouteContext, readJson } from "@/test/api-route-helpers";

describe("/api/v1/projects/[projectId]/issues/[issueId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiActorId.mockResolvedValue("user-1");
    mocks.requireProjectAccess.mockResolvedValue(undefined);
    mocks.repositoryFactory.mockResolvedValue({
      deleteIssue: mocks.deleteIssue,
      getIssueById: mocks.getIssueById,
      updateIssue: mocks.updateIssue,
    });
  });

  it("GET returns issue when project matches", async () => {
    mocks.getIssueById.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      description: "",
      id: "issue-1",
      identifier: "AAA-1",
      priority: "Medium",
      projectId: "project-1",
      status: "Triage",
      title: "Issue 1",
      updatedAt: "2026-03-27T10:00:00Z",
      version: 1,
    });

    const response = await GET(
      new Request(
        "https://hinear.test/api/v1/projects/project-1/issues/issue-1"
      ),
      createRouteContext({ issueId: "issue-1", projectId: "project-1" })
    );

    expect(response.status).toBe(200);
  });

  it("GET returns 404 when issue belongs to another project", async () => {
    mocks.getIssueById.mockResolvedValue({
      id: "issue-1",
      projectId: "project-2",
    });

    const response = await GET(
      new Request(
        "https://hinear.test/api/v1/projects/project-1/issues/issue-1"
      ),
      createRouteContext({ issueId: "issue-1", projectId: "project-1" })
    );

    expect(response.status).toBe(404);
  });

  it("PATCH updates issue", async () => {
    mocks.getIssueById.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      description: "",
      id: "issue-1",
      identifier: "AAA-1",
      priority: "Medium",
      projectId: "project-1",
      status: "Triage",
      title: "Issue 1",
      updatedAt: "2026-03-27T10:00:00Z",
      version: 1,
    });
    mocks.updateIssue.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      description: "",
      id: "issue-1",
      identifier: "AAA-1",
      priority: "High",
      projectId: "project-1",
      status: "In Progress",
      title: "Issue 1",
      updatedAt: "2026-03-27T10:10:00Z",
      version: 2,
    });

    const response = await PATCH(
      new Request(
        "https://hinear.test/api/v1/projects/project-1/issues/issue-1",
        {
          body: JSON.stringify({
            status: "In Progress",
            version: 1,
          }),
          method: "PATCH",
        }
      ),
      createRouteContext({ issueId: "issue-1", projectId: "project-1" })
    );

    expect(response.status).toBe(200);
    expect(mocks.updateIssue).toHaveBeenCalledWith(
      "issue-1",
      expect.objectContaining({
        status: "In Progress",
        updatedBy: "user-1",
        version: 1,
      })
    );
  });

  it("PATCH returns validation error when version is missing", async () => {
    mocks.getIssueById.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      description: "",
      id: "issue-1",
      identifier: "AAA-1",
      priority: "Medium",
      projectId: "project-1",
      status: "Triage",
      title: "Issue 1",
      updatedAt: "2026-03-27T10:00:00Z",
      version: 1,
    });

    const response = await PATCH(
      new Request(
        "https://hinear.test/api/v1/projects/project-1/issues/issue-1",
        {
          body: JSON.stringify({
            status: "In Progress",
          }),
          method: "PATCH",
        }
      ),
      createRouteContext({ issueId: "issue-1", projectId: "project-1" })
    );

    expect(response.status).toBe(400);
    await expect(readJson<any>(response)).resolves.toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" },
    });
  });

  it("DELETE removes issue", async () => {
    mocks.getIssueById.mockResolvedValue({
      id: "issue-1",
      projectId: "project-1",
    });

    const response = await DELETE(
      new Request(
        "https://hinear.test/api/v1/projects/project-1/issues/issue-1",
        {
          method: "DELETE",
        }
      ),
      createRouteContext({ issueId: "issue-1", projectId: "project-1" })
    );

    expect(response.status).toBe(204);
    expect(mocks.deleteIssue).toHaveBeenCalledWith({
      deletedBy: "user-1",
      issueId: "issue-1",
    });
  });
});
