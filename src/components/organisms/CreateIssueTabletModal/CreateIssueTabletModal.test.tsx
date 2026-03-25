import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateIssueTabletModal } from "@/components/organisms/CreateIssueTabletModal";

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

describe("CreateIssueTabletModal", () => {
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

  it("loads labels once and submits selected label names through the hidden input", async () => {
    const { container } = render(
      <CreateIssueTabletModal projectId="project-1" />
    );

    await waitFor(() =>
      expect(getLabelsActionMock).toHaveBeenCalledWith("project-1")
    );
    expect(getLabelsActionMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Select labels"));
    fireEvent.click(screen.getByRole("button", { name: "Bug" }));

    await waitFor(() => {
      const hiddenInput = container.querySelector(
        'input[name="labels"]'
      ) as HTMLInputElement | null;
      expect(hiddenInput?.value).toBe("Bug");
    });
  });
});
