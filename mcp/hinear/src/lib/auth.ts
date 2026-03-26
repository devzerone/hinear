export type McpSession = {
  accessToken: string | null;
  userId: string | null;
};

export function resolveSession(): McpSession {
  return {
    accessToken:
      process.env.HINEAR_MCP_ACCESS_TOKEN?.trim() ||
      process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
      null,
    userId: process.env.HINEAR_MCP_USER_ID?.trim() || null,
  };
}
