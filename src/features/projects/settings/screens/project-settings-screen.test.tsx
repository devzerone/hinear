import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

vi.mock(
  "@/features/projects/settings/components/github-integration-settings-card",
  () => ({
    GitHubIntegrationSettingsCard: () => (
      <div data-testid="github-integration-settings-mock">
        GitHub Integration
      </div>
    ),
  })
);

import { ProjectSettingsScreen } from "@/features/projects/settings/screens/project-settings-screen";

describe("ProjectSettingsScreen", () => {
  beforeEach(() => {
    pushMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  it("deletes the project after confirmation and redirects to overview", async () => {
    const setTimeoutMock = vi
      .spyOn(globalThis, "setTimeout")
      .mockImplementation((callback) => {
        if (typeof callback === "function") {
          callback();
        }

        return 0 as ReturnType<typeof setTimeout>;
      });

    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        })
      )
    );

    render(
      <ProjectSettingsScreen
        detailsAction={vi.fn()}
        inviteAction={vi.fn()}
        project={{
          id: "project-1",
          key: "WEB",
          name: "Web Platform",
          type: "team",
          issueSeq: 2,
          createdBy: "user-1",
          createdAt: "2026-03-20T00:00:00.000Z",
          updatedAt: "2026-03-20T00:00:00.000Z",
        }}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Delete this project" })
    );

    await Promise.resolve();
    await Promise.resolve();

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Project deleted successfully."
    );
    expect(pushMock).toHaveBeenCalledWith("/projects/overview");

    setTimeoutMock.mockRestore();
    vi.unstubAllGlobals();
  });

  it("renders settings navigation as in-page section links", async () => {
    const user = userEvent.setup();

    render(
      <ProjectSettingsScreen
        detailsAction={vi.fn()}
        inviteAction={vi.fn()}
        invitationAction={vi.fn()}
        memberAction={vi.fn()}
        project={{
          id: "project-1",
          key: "WEB",
          name: "Web Platform",
          type: "team",
          issueSeq: 2,
          createdBy: "user-1",
          createdAt: "2026-03-20T00:00:00.000Z",
          updatedAt: "2026-03-20T00:00:00.000Z",
        }}
      />
    );

    const membersLink = screen.getByRole("link", { name: "Members" });
    expect(membersLink).toHaveAttribute("href", "#project-settings-members");

    await user.click(membersLink);

    expect(screen.getByRole("link", { name: "Members" })).toHaveAttribute(
      "aria-current",
      "location"
    );
  });

  it("renders settings navigation and access controls", () => {
    render(
      <ProjectSettingsScreen
        detailsAction={vi.fn()}
        inviteAction={vi.fn()}
        invitations={[
          {
            id: "invitation-1",
            email: "alex@hinear.app",
            token: "token-1",
            invitedBy: "Jamie",
            status: "pending",
            expiresAt: "2026-03-27T00:00:00.000Z",
            createdAt: "2026-03-20T00:00:00.000Z",
          },
        ]}
        members={[
          {
            id: "user-1",
            name: "Alex",
            role: "owner",
            note: "Owner since Mar 20",
            canRemove: false,
            isCurrentUser: true,
          },
          {
            id: "user-2",
            name: "Jordan",
            role: "member",
            note: "Joined Mar 20",
            canRemove: true,
          },
        ]}
        project={{
          id: "project-1",
          key: "WEB",
          name: "Web Platform",
          type: "team",
          issueSeq: 2,
          createdBy: "user-1",
          createdAt: "2026-03-20T00:00:00.000Z",
          updatedAt: "2026-03-20T00:00:00.000Z",
        }}
      />
    );

    // Check main heading
    expect(
      screen.getByRole("heading", { name: "Web Platform project settings" })
    ).toBeInTheDocument();
    // Check form fields
    expect(screen.getByDisplayValue("Web Platform")).toBeInTheDocument();
    expect(screen.getByDisplayValue("WEB")).toBeInTheDocument();
    expect(
      screen.getByTestId("github-integration-settings-mock")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save project details" })
    ).toBeEnabled();
  });

  it("shows delete failure guidance and keeps the user on the same screen", async () => {
    const user = userEvent.setup();

    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Failed to delete project." }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        })
      )
    );

    render(
      <ProjectSettingsScreen
        detailsAction={vi.fn()}
        inviteAction={vi.fn()}
        project={{
          id: "project-1",
          key: "WEB",
          name: "Web Platform",
          type: "team",
          issueSeq: 2,
          createdBy: "user-1",
          createdAt: "2026-03-20T00:00:00.000Z",
          updatedAt: "2026-03-20T00:00:00.000Z",
        }}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Delete this project" })
    );

    await Promise.resolve();
    await Promise.resolve();

    expect(fetch).toHaveBeenCalledWith("/internal/projects/project-1", {
      method: "DELETE",
    });
    expect(toastErrorMock).toHaveBeenCalledWith("Failed to delete project.");
    expect(pushMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
