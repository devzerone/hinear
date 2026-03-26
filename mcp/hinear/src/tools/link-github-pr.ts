import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { linkGitHubPR } from "../adapters/github.js";
import { toTextContent } from "../lib/content.js";
import { linkGitHubPRInputSchema } from "../schemas/github.js";

export function registerLinkGitHubPRTool(server: McpServer) {
  server.registerTool(
    "link_github_pr",
    {
      description:
        "Link a Hinear issue to a GitHub pull request. Optionally enable auto-merge to automatically close the issue when the PR is merged.",
      inputSchema: linkGitHubPRInputSchema,
    },
    async (input) => {
      const data = await linkGitHubPR(input);
      return {
        content: toTextContent(data),
      };
    }
  );
}
