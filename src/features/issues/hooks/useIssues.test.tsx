import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIssues } from "@/features/issues/hooks/useIssues";

describe("useIssues", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("loads the board issues endpoint when no search query is provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        issues: [
          {
            id: "issue-1",
            identifier: "WEB-1",
            title: "Board issue",
            status: "Todo",
            priority: "Medium",
            assignee: null,
            labels: [],
            issueNumber: 1,
            projectId: "project-1",
            dueDate: null,
            createdAt: "2026-03-25T00:00:00.000Z",
            updatedAt: "2026-03-25T00:00:00.000Z",
          },
        ],
      }),
    });

    const { result } = renderHook(() => useIssues("project-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      "/internal/projects/project-1/issues"
    );
    expect(result.current.issues).toHaveLength(1);
  });

  it("uses the search API when a search query is provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        issues: [
          {
            id: "issue-2",
            identifier: "WEB-2",
            title: "Search issue",
            status: "Done",
            priority: "High",
            assignee: null,
            labels: [],
            issueNumber: 2,
            projectId: "project-1",
            dueDate: null,
            createdAt: "2026-03-25T00:00:00.000Z",
            updatedAt: "2026-03-25T00:00:00.000Z",
          },
        ],
      }),
    });

    const { result } = renderHook(() =>
      useIssues("project-1", { searchQuery: "bug" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/issues/search",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
    expect(
      JSON.parse((fetchMock.mock.calls[0] ?? [])[1]?.body as string)
    ).toEqual({
      projectId: "project-1",
      query: "bug",
    });
    expect(result.current.issues).toHaveLength(1);
    expect(result.current.issues[0]?.identifier).toBe("WEB-2");
  });

  it("uses the search API when advanced filters are provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        issues: [],
      }),
    });

    const { result } = renderHook(() =>
      useIssues("project-1", {
        assigneeIds: ["user-1"],
        labelIds: ["label-1"],
        priorities: ["High"],
        statuses: ["Todo"],
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/issues/search",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
    expect(
      JSON.parse((fetchMock.mock.calls[0] ?? [])[1]?.body as string)
    ).toEqual({
      assigneeIds: ["user-1"],
      labelIds: ["label-1"],
      priorities: ["High"],
      projectId: "project-1",
      statuses: ["Todo"],
    });
  });
});
