import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listLabels } from "../adapters/labels.js";
import { toTextContent } from "../lib/content.js";
import { listLabelsInputSchema } from "../schemas/label.js";

export function registerListLabelsTool(server: McpServer) {
  server.registerTool(
    "list_labels",
    {
      description: "List all labels for a Hinear project.",
      inputSchema: listLabelsInputSchema,
    },
    async (input) => {
      const data = await listLabels(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
