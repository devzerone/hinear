import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolveSession } from "./lib/auth.js";
import { readEnv } from "./lib/env.js";
import { registerAddCommentTool } from "./tools/add-comment.js";
import { registerBatchUpdateIssuesTool } from "./tools/batch-update-issues.js";
import { registerCreateGitHubBranchTool } from "./tools/create-github-branch.js";
import { registerCreateIssueTool } from "./tools/create-issue.js";
import { registerCreateLabelTool } from "./tools/create-label.js";
import { registerDeleteLabelTool } from "./tools/delete-label.js";
import { registerGetIssueDetailTool } from "./tools/get-issue-detail.js";
import { registerInviteMemberTool } from "./tools/invite-member.js";
import { registerLinkGitHubIssueTool } from "./tools/link-github-issue.js";
import { registerLinkGitHubPRTool } from "./tools/link-github-pr.js";
import { registerListLabelsTool } from "./tools/list-labels.js";
import { registerListMembersTool } from "./tools/list-members.js";
import { registerListProjectsTool } from "./tools/list-projects.js";
import { registerRemoveMemberTool } from "./tools/remove-member.js";
import { registerSearchIssuesTool } from "./tools/search-issues.js";
import { registerUpdateIssueStatusTool } from "./tools/update-issue-status.js";
import { registerUpdateLabelTool } from "./tools/update-label.js";
import { registerUpdateMemberRoleTool } from "./tools/update-member-role.js";

export function createServer() {
  const env = readEnv();
  const session = resolveSession();

  const server = new McpServer({
    name: "hinear",
    version: "0.2.0",
  });

  registerListProjectsTool(server);
  registerSearchIssuesTool(server);
  registerGetIssueDetailTool(server);
  registerCreateIssueTool(server);
  registerUpdateIssueStatusTool(server);
  registerAddCommentTool(server);
  registerListLabelsTool(server);
  registerCreateLabelTool(server);
  registerUpdateLabelTool(server);
  registerDeleteLabelTool(server);
  registerBatchUpdateIssuesTool(server);
  registerListMembersTool(server);
  registerInviteMemberTool(server);
  registerUpdateMemberRoleTool(server);
  registerRemoveMemberTool(server);
  registerCreateGitHubBranchTool(server);
  registerLinkGitHubIssueTool(server);
  registerLinkGitHubPRTool(server);

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
                "list_labels",
                "create_label",
                "update_label",
                "delete_label",
                "batch_update_issues",
                "list_members",
                "invite_member",
                "update_member_role",
                "remove_member",
                "create_github_branch",
                "link_github_issue",
                "link_github_pr",
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
