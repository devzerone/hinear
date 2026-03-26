import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { linkGitHubIssue } from "../adapters/github.js";
import { toTextContent } from "../lib/content.js";
import { linkGitHubIssueInputSchema } from "../schemas/github.js";

export function registerLinkGitHubIssueTool(server: McpServer) {
  server.registerTool(
    "link_github_issue",
    {
      description: "Link a Hinear issue to a GitHub issue.",
      inputSchema: linkGitHubIssueInputSchema,
    },
    async (input) => {
      const data = await linkGitHubIssue(input);
      return {
        content: toTextContent(data),
      };
    }
  );
}
