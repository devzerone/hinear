import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectWorkspaceScreen } from "@/features/projects/components/project-workspace-screen";

describe("ProjectWorkspaceScreen", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ issues: [], total: 0 }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the project context and opens the issue creation modal", async () => {
    const user = userEvent.setup();

    render(
      <ProjectWorkspaceScreen
        action={vi.fn()}
        project={{
          id: "project-1",
          key: "WEB",
          name: "Web Platform",
          type: "team",
          issueSeq: 1,
          createdBy: "user-1",
          createdAt: "2026-03-20T00:00:00.000Z",
          updatedAt: "2026-03-20T00:00:00.000Z",
        }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Web Platform" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Create a new triage issue for WEB.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create issue" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create issue" }));

    expect(
      screen.getByRole("heading", { name: "Create issue" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });
});
