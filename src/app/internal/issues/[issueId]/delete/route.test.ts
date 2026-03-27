import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { deleteIssueActionMock, getAuthenticatedActorIdOrNullMock } = vi.hoisted(
  () => ({
    deleteIssueActionMock: vi.fn(),
    getAuthenticatedActorIdOrNullMock: vi.fn(),
  })
);

vi.mock("@/lib/supabase/server-auth", () => ({
  getAuthenticatedActorIdOrNull: getAuthenticatedActorIdOrNullMock,
}));

vi.mock("@/features/issues/actions/delete-issue-action", () => ({
  deleteIssueAction: deleteIssueActionMock,
}));

import { POST } from "@/app/internal/issues/[issueId]/delete/route";

describe("POST /internal/issues/[issueId]/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the request has no authenticated actor", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue(null);

    const response = await POST(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ issueId: "issue-1" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "AUTH_REQUIRED",
      error: "Authentication required.",
    });
  });

  it("returns 400 when projectId is missing from the request body", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-1");

    const response = await POST(
      new Request("https://hinear.test/internal", {
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
      {
        params: Promise.resolve({ issueId: "issue-1" }),
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "INVALID_PROJECT",
      error: "Project ID is required.",
    });
  });

  it("returns success when the issue is deleted", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-1");
    deleteIssueActionMock.mockResolvedValue({ success: true });

    const response = await POST(
      new Request("https://hinear.test/internal", {
        body: JSON.stringify({ projectId: "project-1" }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
      {
        params: Promise.resolve({ issueId: "issue-1" }),
      }
    );

    expect(deleteIssueActionMock).toHaveBeenCalledWith({
      issueId: "issue-1",
      projectId: "project-1",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it("returns 500 when the delete action fails", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-1");
    deleteIssueActionMock.mockResolvedValue({
      error: "We couldn't save your changes. Try again.",
      success: false,
    });

    const response = await POST(
      new Request("https://hinear.test/internal", {
        body: JSON.stringify({ projectId: "project-1" }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
      {
        params: Promise.resolve({ issueId: "issue-1" }),
      }
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: "DELETE_FAILED",
      error: "We couldn't save your changes. Try again.",
    });
  });
});
