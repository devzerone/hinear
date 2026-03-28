import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  addMember: vi.fn(),
  listMembers: vi.fn(),
  requireApiActorId: vi.fn(),
  requireProjectAccess: vi.fn(),
  requireProjectOwner: vi.fn(),
  repositoryFactory: vi.fn(),
}));

vi.mock("@/app/api/_lib/auth", () => ({
  requireApiActorId: mocks.requireApiActorId,
  requireProjectAccess: mocks.requireProjectAccess,
  requireProjectOwner: mocks.requireProjectOwner,
}));

vi.mock(
  "@/features/project-members/repositories/server-project-members-repository",
  () => ({
    getServerProjectMembersRepository: mocks.repositoryFactory,
  })
);

import { GET, POST } from "@/app/api/v1/projects/[projectId]/members/route";
import { createRouteContext, readJson } from "@/test/api-route-helpers";

describe("/api/v1/projects/[projectId]/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiActorId.mockResolvedValue("user-1");
    mocks.repositoryFactory.mockResolvedValue({
      addMember: mocks.addMember,
      listMembers: mocks.listMembers,
    });
  });

  it("GET returns members", async () => {
    mocks.requireProjectAccess.mockResolvedValue(undefined);
    mocks.listMembers.mockResolvedValue([
      {
        createdAt: "2026-03-27T10:00:00Z",
        projectId: "project-1",
        role: "owner",
        userId: "user-1",
      },
    ]);

    const response = await GET(
      new Request("https://hinear.test/api/v1/projects/project-1/members"),
      createRouteContext({ projectId: "project-1" })
    );

    expect(response.status).toBe(200);
    await expect(readJson<any>(response)).resolves.toMatchObject({
      success: true,
      data: {
        items: [{ userId: "user-1" }],
      },
    });
  });

  it("POST creates member", async () => {
    mocks.requireProjectOwner.mockResolvedValue(undefined);
    mocks.addMember.mockResolvedValue({
      createdAt: "2026-03-27T10:00:00Z",
      projectId: "project-1",
      role: "member",
      userId: "user-2",
    });

    const response = await POST(
      new Request("https://hinear.test/api/v1/projects/project-1/members", {
        body: JSON.stringify({
          role: "member",
          userId: "user-2",
        }),
        method: "POST",
      }),
      createRouteContext({ projectId: "project-1" })
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("Location")).toBe(
      "/api/v1/projects/project-1/members/user-2"
    );
  });

  it("POST returns forbidden when owner check fails", async () => {
    mocks.requireProjectOwner.mockRejectedValue(
      new Error("Only project owners can perform this action")
    );

    const response = await POST(
      new Request("https://hinear.test/api/v1/projects/project-1/members", {
        body: JSON.stringify({ role: "member", userId: "user-2" }),
        method: "POST",
      }),
      createRouteContext({ projectId: "project-1" })
    );

    expect(response.status).toBe(500);
  });
});
