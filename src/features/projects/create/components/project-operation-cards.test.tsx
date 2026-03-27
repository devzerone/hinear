import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useFormStatusMock } = vi.hoisted(() => ({
  useFormStatusMock: vi.fn(() => ({ pending: false })),
}));

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
  return {
    ...actual,
    useFormStatus: useFormStatusMock,
  };
});

import { ProjectAccessCard } from "@/features/projects/settings/components/project-access-card";

describe("ProjectAccessCard", () => {
  beforeEach(() => {
    useFormStatusMock.mockReturnValue({ pending: false });
  });

  it("shows pending labels for access-management form submissions", () => {
    useFormStatusMock.mockReturnValue({ pending: true });

    render(
      <ProjectAccessCard
        action={vi.fn()}
        invitationAction={vi.fn()}
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
        memberAction={vi.fn()}
        members={[
          {
            id: "member-1",
            name: "Alex Kim",
            role: "owner",
            note: "Owner since Mar 20",
            canRemove: false,
            isCurrentUser: true,
          },
          {
            id: "member-2",
            name: "Jordan Park",
            role: "member",
            note: "Joined Mar 20",
            canRemove: true,
          },
        ]}
      />
    );

    expect(
      screen.getByRole("button", { name: "Sending invite..." })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Resending..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Revoking..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Removing..." })).toBeDisabled();
  });

  it("filters members and invitations from the search field", async () => {
    const user = userEvent.setup();

    render(
      <ProjectAccessCard
        action={vi.fn()}
        invitationAction={vi.fn()}
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
            id: "member-1",
            name: "Alex Kim",
            role: "owner",
            note: "Owner since Mar 20",
            canRemove: false,
            isCurrentUser: true,
          },
          {
            id: "member-2",
            name: "Jordan Park",
            role: "member",
            note: "Joined Mar 20",
            canRemove: true,
          },
        ]}
      />
    );

    await user.type(screen.getByLabelText("Search members"), "alex");

    expect(screen.getByText("Alex Kim")).toBeInTheDocument();
    expect(screen.queryByText("Jordan Park")).not.toBeInTheDocument();
    expect(screen.getByText("alex@hinear.app")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View pending invitations" })
    ).toHaveAttribute("href", "#pending-invitations");
  });

  it("renders an empty search state when no member matches", async () => {
    const user = userEvent.setup();

    render(
      <ProjectAccessCard
        members={[
          {
            id: "member-1",
            name: "Alex Kim",
            role: "owner",
            note: "Owner since Mar 20",
            canRemove: false,
          },
        ]}
      />
    );

    await user.type(screen.getByLabelText("Search members"), "nobody");

    expect(screen.getByText("No members match “nobody”.")).toBeInTheDocument();
  });

  it("disables access management controls for non-owner viewers", () => {
    render(
      <ProjectAccessCard
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
            id: "member-1",
            name: "Alex Kim",
            role: "owner",
            note: "Owner since Mar 20",
            canRemove: false,
          },
          {
            id: "member-2",
            name: "Jordan Park",
            role: "member",
            note: "Joined Mar 20",
            canRemove: true,
            isCurrentUser: true,
          },
        ]}
      />
    );

    expect(screen.getByLabelText("Invite member")).toBeDisabled();
    expect(
      screen.getByText(
        "Pending invitation controls are limited to project owners."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Owner only")).toBeInTheDocument();
  });
});
