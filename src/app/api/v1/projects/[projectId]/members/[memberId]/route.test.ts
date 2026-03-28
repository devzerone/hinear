import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  removeMember: vi.fn(),
  repositoryFactory: vi.fn(),
  requireApiActorId: vi.fn(),
  requireProjectOwner: vi.fn(),
}));

vi.mock("@/app/api/_lib/auth", () => ({
  requireApiActorId: mocks.requireApiActorId,
  requireProjectOwner: mocks.requireProjectOwner,
}));

vi.mock(
  "@/features/project-members/repositories/server-project-members-repository",
  () => ({
    getServerProjectMembersRepository: mocks.repositoryFactory,
  })
);

import { DELETE } from "@/app/api/v1/projects/[projectId]/members/[memberId]/route";
import { createRouteContext } from "@/test/api-route-helpers";

describe("DELETE /api/v1/projects/[projectId]/members/[memberId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiActorId.mockResolvedValue("user-1");
    mocks.requireProjectOwner.mockResolvedValue(undefined);
    mocks.repositoryFactory.mockResolvedValue({
      removeMember: mocks.removeMember,
    });
  });

  it("removes member and returns 204", async () => {
    const response = await DELETE(
      new Request(
        "https://hinear.test/api/v1/projects/project-1/members/user-2",
        {
          method: "DELETE",
        }
      ),
      createRouteContext({ memberId: "user-2", projectId: "project-1" })
    );

    expect(mocks.removeMember).toHaveBeenCalledWith({
      projectId: "project-1",
      removedBy: "user-1",
      userId: "user-2",
    });
    expect(response.status).toBe(204);
  });
});
