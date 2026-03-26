import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { updateLabel } from "../adapters/labels.js";
import { toTextContent } from "../lib/content.js";
import { updateLabelInputSchema } from "../schemas/label.js";

export function registerUpdateLabelTool(server: McpServer) {
  server.registerTool(
    "update_label",
    {
      description: "Update an existing label in a Hinear project.",
      inputSchema: updateLabelInputSchema,
    },
    async (input) => {
      const data = await updateLabel(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
