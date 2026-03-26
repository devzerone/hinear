import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { removeMember } from "../adapters/members.js";
import { toTextContent } from "../lib/content.js";
import { removeMemberInputSchema } from "../schemas/member.js";

export function registerRemoveMemberTool(server: McpServer) {
  server.registerTool(
    "remove_member",
    {
      description:
        "Remove a member from a Hinear project or revoke a pending invitation.",
      inputSchema: removeMemberInputSchema,
    },
    async (input) => {
      const data = await removeMember(input);
      return {
        content: toTextContent(data),
      };
    }
  );
}
