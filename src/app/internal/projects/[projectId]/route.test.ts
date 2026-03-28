import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
  deleteProjectMock,
  getAuthenticatedActorIdOrNullMock,
  getProjectByIdMock,
  getServerProjectsRepositoryMock,
} = vi.hoisted(() => ({
  deleteProjectMock: vi.fn(),
  getAuthenticatedActorIdOrNullMock: vi.fn(),
  getProjectByIdMock: vi.fn(),
  getServerProjectsRepositoryMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server-auth", () => ({
  getAuthenticatedActorIdOrNull: getAuthenticatedActorIdOrNullMock,
}));

vi.mock("@/features/projects/repositories/server-projects-repository", () => ({
  getServerProjectsRepository: getServerProjectsRepositoryMock,
}));

import { DELETE } from "@/app/internal/projects/[projectId]/route";
import { createRepositoryError } from "@/features/issues/lib/repository-errors";

describe("DELETE /internal/projects/[projectId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerProjectsRepositoryMock.mockResolvedValue({
      deleteProject: deleteProjectMock,
      getProjectById: getProjectByIdMock,
    });
  });

  it("returns 401 when the request has no authenticated actor", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue(null);

    const response = await DELETE(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "AUTH_REQUIRED",
      error: "Authentication required.",
    });
  });

  it("returns 404 when the project does not exist", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-1");
    getProjectByIdMock.mockResolvedValue(null);

    const response = await DELETE(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(deleteProjectMock).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      code: "PROJECT_NOT_FOUND",
      error: "Project not found.",
    });
  });

  it("returns 403 when a non-owner tries to delete the project", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-2");
    getProjectByIdMock.mockResolvedValue({
      createdBy: "user-1",
      id: "project-1",
      key: "WEB",
      name: "Web Platform",
      type: "team",
    });

    const response = await DELETE(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(deleteProjectMock).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "FORBIDDEN",
      error: "Only project owners can delete projects.",
    });
  });

  it("deletes the project for the owner and returns success", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-1");
    getProjectByIdMock.mockResolvedValue({
      createdBy: "user-1",
      id: "project-1",
      key: "WEB",
      name: "Web Platform",
      type: "team",
    });
    deleteProjectMock.mockResolvedValue(undefined);

    const response = await DELETE(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(deleteProjectMock).toHaveBeenCalledWith({
      deletedBy: "user-1",
      projectId: "project-1",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it("returns repository failures with their original status", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-1");
    getProjectByIdMock.mockResolvedValue({
      createdBy: "user-1",
      id: "project-1",
      key: "WEB",
      name: "Web Platform",
      type: "team",
    });
    deleteProjectMock.mockRejectedValue(
      createRepositoryError("FORBIDDEN", "policy denied delete")
    );

    const response = await DELETE(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "FORBIDDEN",
      error: "policy denied delete",
    });
  });
});
