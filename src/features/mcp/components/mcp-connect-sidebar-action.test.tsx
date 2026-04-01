import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { McpConnectSidebarAction } from "@/features/mcp/components/mcp-connect-sidebar-action";

describe("McpConnectSidebarAction", () => {
  it("opens the modal and shows Codex and Claude Code commands", () => {
    render(<McpConnectSidebarAction />);

    fireEvent.click(screen.getByRole("button", { name: "Connect MCP" }));

    expect(
      screen.getByRole("heading", {
        name: "Connect Hinear to Codex or Claude Code",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "codex mcp add hinear --url http://localhost:3000/api/mcp"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "claude mcp add --transport http hinear http://localhost:3000/api/mcp"
      )
    ).toBeInTheDocument();
  });
});
