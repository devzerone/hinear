import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileIssueCreateScreen } from "@/features/issues/components/mobile-issue-create-screen";

const { createLabelActionMock, getLabelsActionMock } = vi.hoisted(() => ({
  createLabelActionMock: vi.fn(),
  getLabelsActionMock: vi.fn(),
}));

vi.mock("@/features/issues/actions/get-labels-action", () => ({
  getLabelsAction: getLabelsActionMock,
}));

vi.mock("@/features/issues/actions/create-label-action", () => ({
  createLabelAction: createLabelActionMock,
}));

describe("MobileIssueCreateScreen", () => {
  beforeEach(() => {
    getLabelsActionMock.mockReset();
    createLabelActionMock.mockReset();
    getLabelsActionMock.mockResolvedValue({
      success: true,
      labels: [
        { id: "label-1", name: "Bug", color: "#DC2626" },
        { id: "label-2", name: "Docs", color: "#2563EB" },
      ],
    });
    createLabelActionMock.mockResolvedValue({
      success: true,
      label: { id: "label-3", name: "Mobile", color: "#16A34A" },
    });
  });

  it("loads labels once and keeps the selected labels in the form payload", async () => {
    const { container } = render(
      <MobileIssueCreateScreen
        cancelHref="/projects/project-1"
        projectId="project-1"
      />
    );

    await waitFor(() =>
      expect(getLabelsActionMock).toHaveBeenCalledWith("project-1")
    );
    expect(getLabelsActionMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Select labels"));
    fireEvent.click(screen.getByRole("button", { name: "Docs" }));

    await waitFor(() => {
      const hiddenInput = container.querySelector(
        'input[name="labels"]'
      ) as HTMLInputElement | null;
      expect(hiddenInput?.value).toBe("Docs");
    });
  });
});
