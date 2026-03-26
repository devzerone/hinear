import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getIssueDetail } from "../adapters/issues.js";
import { toTextContent } from "../lib/content.js";
import { getIssueDetailInputSchema } from "../schemas/issue.js";

export function registerGetIssueDetailTool(server: McpServer) {
  server.registerTool(
    "get_issue_detail",
    {
      description:
        "Get a Hinear issue with description, labels, recent comments, and recent activity.",
      inputSchema: getIssueDetailInputSchema,
    },
    async (input) => {
      const data = await getIssueDetail(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
