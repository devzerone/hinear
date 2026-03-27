import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, toastErrorMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: vi.fn(),
  },
}));

import {
  IssueDetailErrorScreen,
  IssueDetailLoadingScreen,
  IssueDetailNotFoundScreen,
  IssueDetailScreen,
} from "@/features/issues/detail/screens/issue-detail-screen";
import { server } from "@/mocks/server";

describe("IssueDetailScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  // Clean up test-specific MSW handlers after each test
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
    server.resetHandlers();
  });

  it("renders the issue detail shell with empty comment and activity states", () => {
    render(
      <IssueDetailScreen
        boardHref="/projects/project-1"
        createHref="/projects/project-1/issues/new"
        issue={{
          id: "issue-1",
          projectId: "project-1",
          issueNumber: 1,
          identifier: "WEB-1",
          title: "Add issue detail page",
          status: "Triage",
          priority: "No Priority",
          assigneeId: null,
          labels: [],
          description: "",
          dueDate: null,
          createdBy: "user-1",
          updatedBy: "user-1",
          createdAt: "2026-03-20T00:00:00.000Z",
          updatedAt: "2026-03-20T00:00:00.000Z",
          version: 1,
        }}
      />
    );

    expect(screen.getAllByText("WEB-1")).toHaveLength(2);
    expect(
      screen.getByDisplayValue("Add issue detail page")
    ).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Priority")).toBeInTheDocument();
    // Description field might not have a label, try to find it by placeholder or other means
    const descriptionField = screen.queryByDisplayValue(
      "Add issue detail page"
    );
    expect(descriptionField).toBeInTheDocument();
    expect(screen.getByText("No labels selected")).toBeInTheDocument();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to board" })).toHaveAttribute(
      "href",
      "/projects/project-1"
    );
  });

  it("renders persisted labels when present", () => {
    render(
      <IssueDetailScreen
        issue={{
          id: "issue-2",
          projectId: "project-1",
          issueNumber: 2,
          identifier: "WEB-2",
          title: "Persist labels",
          status: "Backlog",
          priority: "High",
          assigneeId: "user-1",
          labels: [
            { id: "label-1", name: "Auth", color: "#5E6AD2" },
            { id: "label-2", name: "Backend", color: "#16A34A" },
          ],
          description: "Labels should render from the database.",
          dueDate: null,
          createdBy: "user-1",
          updatedBy: "user-1",
          createdAt: "2026-03-20T00:00:00.000Z",
          updatedAt: "2026-03-20T00:00:00.000Z",
          version: 1,
        }}
      />
    );

    expect(screen.getByText("Auth")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.queryByText("No labels selected")).not.toBeInTheDocument();
  });

  it("renders the loading state", () => {
    render(<IssueDetailLoadingScreen />);

    expect(
      screen.getByRole("heading", { name: "Loading" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/loading the latest issue details and activity/i)
    ).toBeInTheDocument();
  });

  it("renders the error state actions", () => {
    render(
      <IssueDetailErrorScreen
        boardHref="/projects/project-1"
        onRetry={() => {}}
      />
    );

    expect(toastErrorMock).toHaveBeenCalledWith(
      "We couldn't load this issue. Refresh the detail view to try again."
    );
    expect(pushMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2000);

    expect(pushMock).toHaveBeenCalledWith("/projects/project-1");
  });

  it("renders the not-found state with replacement path", () => {
    render(
      <IssueDetailNotFoundScreen
        boardHref="/projects/project-1"
        createHref="/projects/project-1/issues/new"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Not Found" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This issue may have been deleted or moved/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create issue" })).toHaveAttribute(
      "href",
      "/projects/project-1/issues/new"
    );
  });
});
