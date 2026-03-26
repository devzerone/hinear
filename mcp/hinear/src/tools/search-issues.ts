import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchIssues } from "../adapters/issues.js";
import { toTextContent } from "../lib/content.js";
import { searchIssuesInputSchema } from "../schemas/issue.js";

export function registerSearchIssuesTool(server: McpServer) {
  server.registerTool(
    "search_issues",
    {
      description:
        "Search Hinear issues within a project using filters like status, priority, assignee, and due date.",
      inputSchema: searchIssuesInputSchema,
    },
    async (input) => {
      const data = await searchIssues(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
