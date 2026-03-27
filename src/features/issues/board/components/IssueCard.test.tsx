import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    isDragging: false,
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
  }),
}));

import { IssueCard } from "@/features/issues/board/components/IssueCard";

const issue = {
  id: "issue-1",
  identifier: "WEB-1",
  title: "Selection behavior",
  status: "Backlog",
  priority: "Medium",
  labels: [],
  assignee: null,
};

describe("IssueCard", () => {
  it("navigates to detail when selection mode is off", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <IssueCard issue={issue} onNavigate={onNavigate} projectId="project-1" />
    );

    await user.click(screen.getByText("Selection behavior"));

    expect(onNavigate).toHaveBeenCalledWith(issue);
    expect(
      screen.queryByRole("button", { name: /select issue/i })
    ).not.toBeInTheDocument();
  });

  it("toggles selection instead of navigating in selection mode", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onToggleSelect = vi.fn();

    render(
      <IssueCard
        isSelected
        issue={issue}
        onNavigate={onNavigate}
        onToggleSelect={onToggleSelect}
        projectId="project-1"
        selectionMode
      />
    );

    await user.click(screen.getByText("Selection behavior"));

    expect(onToggleSelect).toHaveBeenCalledWith("issue-1");
    expect(onNavigate).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: /deselect issue/i })
    ).not.toBeInTheDocument();
  });
});
