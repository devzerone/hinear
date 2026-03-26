import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createIssue } from "../adapters/issues.js";
import { toTextContent } from "../lib/content.js";
import { createIssueInputSchema } from "../schemas/issue.js";

export function registerCreateIssueTool(server: McpServer) {
  server.registerTool(
    "create_issue",
    {
      description:
        "Create a Hinear issue from structured fields prepared by the calling agent.",
      inputSchema: createIssueInputSchema,
    },
    async (input) => {
      const data = await createIssue(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
