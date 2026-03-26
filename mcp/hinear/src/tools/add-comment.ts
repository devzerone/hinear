import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { addComment } from "../adapters/comments.js";
import { toTextContent } from "../lib/content.js";
import { addCommentInputSchema } from "../schemas/comment.js";

export function registerAddCommentTool(server: McpServer) {
  server.registerTool(
    "add_comment",
    {
      description: "Add a comment to a Hinear issue.",
      inputSchema: addCommentInputSchema,
    },
    async (input) => {
      const data = await addComment(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
