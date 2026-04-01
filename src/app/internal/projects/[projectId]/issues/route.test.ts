import { beforeEach, describe, expect, it, vi } from "vitest";

// server-only 모듈 mock 처리
vi.mock("server-only", () => ({}));

const {
  getAuthenticatedActorIdOrNullMock,
  createRequestSupabaseServerClientMock,
} = vi.hoisted(() => ({
  getAuthenticatedActorIdOrNullMock: vi.fn(),
  createRequestSupabaseServerClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server-auth", () => ({
  getAuthenticatedActorIdOrNull: getAuthenticatedActorIdOrNullMock,
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createRequestSupabaseServerClient: createRequestSupabaseServerClientMock,
}));

import { GET } from "@/app/internal/projects/[projectId]/issues/route";

describe("GET /internal/projects/[projectId]/issues", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockSupabaseClient({
    issuesError = null,
    issuesData = [],
  }: {
    issuesError?: { message: string; code?: string } | null;
    issuesData?: Array<Record<string, unknown>>;
  }) {
    return {
      rpc: vi.fn(() =>
        Promise.resolve({
          data: issuesData,
          error: issuesError,
        })
      ),
    };
  }

  it("returns 401 when the request has no authenticated actor", async () => {
    getAuthenticatedActorIdOrNullMock.mockResolvedValue(null);

    const response = await GET(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "AUTH_REQUIRED",
      error: "Authentication required.",
    });
  });

  it("returns project issues mapped to the board contract", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
      issuesData: [
        {
          id: "issue-1",
          project_id: "project-1",
          issue_number: 12,
          identifier: "WEB-12",
          title: "Persist labels on board",
          status: "Todo",
          priority: "Medium",
          assignee: {
            id: "user-1",
            name: "Assignee",
            avatarUrl: "https://example.com/avatar.png",
          },
          labels: [],
          due_date: null,
          created_at: "2026-03-20T00:00:00.000Z",
          updated_at: "2026-03-20T01:00:00.000Z",
        },
      ],
    });

    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-1");
    createRequestSupabaseServerClientMock.mockResolvedValue(
      mockSupabaseClient as unknown as ReturnType<
        typeof createRequestSupabaseServerClientMock
      >
    );

    const response = await GET(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.issues).toHaveLength(1);
    expect(json.issues[0]).toMatchObject({
      id: "issue-1",
      identifier: "WEB-12",
      title: "Persist labels on board",
      status: "Todo",
      priority: "Medium",
    });
    expect(json.total).toBe(1);
  });

  it("returns a structured error payload when database query fails", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
      issuesData: [],
      issuesError: {
        message: "permission denied for table issues",
        code: "42501",
      },
    });

    getAuthenticatedActorIdOrNullMock.mockResolvedValue("user-1");
    createRequestSupabaseServerClientMock.mockResolvedValue(
      mockSupabaseClient as unknown as ReturnType<
        typeof createRequestSupabaseServerClientMock
      >
    );

    const response = await GET(new Request("https://hinear.test/internal"), {
      params: Promise.resolve({ projectId: "project-1" }),
    });

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toContain("Failed to load issues");
  });
});
