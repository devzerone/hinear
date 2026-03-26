import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { deleteLabel } from "../adapters/labels.js";
import { toTextContent } from "../lib/content.js";
import { deleteLabelInputSchema } from "../schemas/label.js";

export function registerDeleteLabelTool(server: McpServer) {
  server.registerTool(
    "delete_label",
    {
      description: "Delete a label from a Hinear project.",
      inputSchema: deleteLabelInputSchema,
    },
    async (input) => {
      const data = await deleteLabel(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
