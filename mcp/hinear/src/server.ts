import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolveSession } from "./lib/auth.js";
import { readEnv } from "./lib/env.js";
import { registerAddCommentTool } from "./tools/add-comment.js";
import { registerCreateIssueTool } from "./tools/create-issue.js";
import { registerGetIssueDetailTool } from "./tools/get-issue-detail.js";
import { registerListProjectsTool } from "./tools/list-projects.js";
import { registerSearchIssuesTool } from "./tools/search-issues.js";
import { registerUpdateIssueStatusTool } from "./tools/update-issue-status.js";

export function createServer() {
  const env = readEnv();
  const session = resolveSession();

  const server = new McpServer({
    name: "hinear",
    version: "0.1.0",
  });

  registerListProjectsTool(server);
  registerSearchIssuesTool(server);
  registerGetIssueDetailTool(server);
  registerCreateIssueTool(server);
  registerUpdateIssueStatusTool(server);
  registerAddCommentTool(server);

  server.tool(
    "hinear_mcp_status",
    "Return basic status information for the local Hinear MCP process.",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ok: true,
              transport: "stdio",
              accessTokenConfigured: Boolean(session.accessToken),
              appOrigin: env.appOrigin,
              supabaseUrlConfigured: Boolean(env.supabaseUrl),
              supabaseAnonKeyConfigured: Boolean(env.supabaseAnonKey),
              userIdConfigured: Boolean(session.userId),
              implementedTools: [
                "list_projects",
                "search_issues",
                "get_issue_detail",
                "create_issue",
                "update_issue_status",
                "add_comment",
              ],
              scaffoldedTools: [],
              note: "The Hinear MCP MVP is connected and ready for local use once auth and Supabase env are configured.",
            },
            null,
            2
          ),
        },
      ],
    })
  );

  return server;
}

export async function startServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
