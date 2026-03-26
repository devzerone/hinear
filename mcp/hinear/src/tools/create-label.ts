import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLabel } from "../adapters/labels.js";
import { toTextContent } from "../lib/content.js";
import { createLabelInputSchema } from "../schemas/label.js";

export function registerCreateLabelTool(server: McpServer) {
  server.registerTool(
    "create_label",
    {
      description:
        "Create a new label for a Hinear project. Labels help categorize and organize issues.",
      inputSchema: createLabelInputSchema,
    },
    async (input) => {
      const data = await createLabel(input);

      return {
        content: toTextContent(data),
      };
    }
  );
}
