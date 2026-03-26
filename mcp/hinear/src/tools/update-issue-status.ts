import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { updateIssueStatus } from "../adapters/issues.js";
import { toTextContent } from "../lib/content.js";
import { updateIssueStatusInputSchema } from "../schemas/issue.js";

export function registerUpdateIssueStatusTool(server: McpServer) {
  server.registerTool(
    "update_issue_status",
    {
      description:
        "Move a Hinear issue between states like triage, backlog, todo, in_progress, done, and canceled.",
      inputSchema: updateIssueStatusInputSchema,
    },
    async (input) => {
      const data = await updateIssueStatus(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
