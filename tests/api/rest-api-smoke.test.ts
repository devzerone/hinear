import { beforeEach, describe, expect, it, vi } from "vitest";

const projectRouteMocks = vi.hoisted(() => ({
  createProject: vi.fn(),
  getServerProjectsRepository: vi.fn(),
  requireApiActorId: vi.fn(),
}));

vi.mock("@/app/api/_lib/auth", async () => {
  const actual = await vi.importActual<any>("@/app/api/_lib/auth");
  return {
    ...actual,
    requireApiActorId: projectRouteMocks.requireApiActorId,
  };
});

vi.mock("@/features/projects/repositories/server-projects-repository", () => ({
  getServerProjectsRepository: projectRouteMocks.getServerProjectsRepository,
}));

import { POST as createProjectRoute } from "@/app/api/v1/projects/route";

describe("REST API smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectRouteMocks.requireApiActorId.mockResolvedValue("user-1");
    projectRouteMocks.createProject.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      id: "project-1",
      key: "AAA",
      name: "Alpha",
      type: "team",
      updatedAt: "2026-03-27T10:00:00Z",
    });
    projectRouteMocks.getServerProjectsRepository.mockResolvedValue({
      createProject: projectRouteMocks.createProject,
    });
  });

  it("creates a project through the v1 route contract", async () => {
    const response = await createProjectRoute(
      new Request("https://hinear.test/api/v1/projects", {
        body: JSON.stringify({
          key: "AAA",
          name: "Alpha",
          type: "team",
        }),
        method: "POST",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("project-1");
  });
});
