import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkProjectAccess: vi.fn(),
  deleteProject: vi.fn(),
  getProjectById: vi.fn(),
  getServerProjectsRepository: vi.fn(),
  requireApiActorId: vi.fn(),
  requireProjectOwner: vi.fn(),
  updateProject: vi.fn(),
}));

vi.mock("@/app/api/_lib/auth", () => ({
  requireApiActorId: mocks.requireApiActorId,
  requireProjectOwner: mocks.requireProjectOwner,
}));

vi.mock("@/features/projects/repositories/server-projects-repository", () => ({
  getServerProjectsRepository: mocks.getServerProjectsRepository,
}));

import { DELETE, GET, PATCH } from "@/app/api/v1/projects/[projectId]/route";
import { createRouteContext, readJson } from "@/test/api-route-helpers";

describe("/api/v1/projects/[projectId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiActorId.mockResolvedValue("user-1");
    mocks.getServerProjectsRepository.mockResolvedValue({
      checkProjectAccess: mocks.checkProjectAccess,
      deleteProject: mocks.deleteProject,
      getProjectById: mocks.getProjectById,
      updateProject: mocks.updateProject,
    });
  });

  it("GET returns project when accessible", async () => {
    mocks.checkProjectAccess.mockResolvedValue(true);
    mocks.getProjectById.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      id: "project-1",
      key: "AAA",
      name: "Alpha",
      type: "team",
      updatedAt: "2026-03-27T10:00:00Z",
    });

    const response = await GET(
      new Request("https://hinear.test/api/v1/projects/project-1"),
      createRouteContext({ projectId: "project-1" })
    );

    expect(response.status).toBe(200);
  });

  it("PATCH updates project", async () => {
    mocks.requireProjectOwner.mockResolvedValue(undefined);
    mocks.getProjectById.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      id: "project-1",
      key: "AAA",
      name: "Alpha",
      type: "team",
      updatedAt: "2026-03-27T10:00:00Z",
    });
    mocks.updateProject.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      id: "project-1",
      key: "BBB",
      name: "Beta",
      type: "team",
      updatedAt: "2026-03-27T10:05:00Z",
    });

    const response = await PATCH(
      new Request("https://hinear.test/api/v1/projects/project-1", {
        body: JSON.stringify({ key: "BBB", name: "Beta" }),
        method: "PATCH",
      }),
      createRouteContext({ projectId: "project-1" })
    );

    expect(response.status).toBe(200);
    expect(mocks.updateProject).toHaveBeenCalledWith({
      key: "BBB",
      name: "Beta",
      projectId: "project-1",
      type: "team",
    });
  });

  it("DELETE returns 204", async () => {
    mocks.requireProjectOwner.mockResolvedValue(undefined);
    mocks.deleteProject.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request("https://hinear.test/api/v1/projects/project-1", {
        method: "DELETE",
      }),
      createRouteContext({ projectId: "project-1" })
    );

    expect(response.status).toBe(204);
  });

  it("GET returns 404 when inaccessible", async () => {
    mocks.checkProjectAccess.mockResolvedValue(false);

    const response = await GET(
      new Request("https://hinear.test/api/v1/projects/project-1"),
      createRouteContext({ projectId: "project-1" })
    );

    expect(response.status).toBe(404);
    await expect(readJson<any>(response)).resolves.toMatchObject({
      success: false,
      error: { code: "NOT_FOUND" },
    });
  });
});
