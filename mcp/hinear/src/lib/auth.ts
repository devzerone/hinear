import { createMcpServiceRoleSupabaseClient } from "./supabase.js";
import { hashToken } from "./token-utils.js";

export type McpSession = {
  accessToken: string | null;
  userId: string | null;
};

export async function resolveAccessToken(
  accessToken: string | null
): Promise<{ userId: string | null; error?: string }> {
  if (!accessToken) {
    return { userId: null };
  }

  // If it looks like a service role key, return null (no specific user)
  if (accessToken.startsWith("eyJ") && accessToken.length > 100) {
    return { userId: null };
  }

  // Try to resolve as MCP access token
  if (accessToken.startsWith("hinear_mcp_")) {
    try {
      const supabase = createMcpServiceRoleSupabaseClient();
      const tokenHash = hashToken(accessToken);

      const { data, error } = await supabase
        .from("mcp_access_tokens")
        .select("user_id")
        .eq("token_hash", tokenHash)
        .is("revoked_at", null)
        .or("expires_at.is.null,expires_at.gt.now()")
        .single();

      if (error || !data) {
        return { userId: null, error: "Invalid or expired token" };
      }

      // Update last_used_at
      await supabase
        .from("mcp_access_tokens")
        .update({ last_used_at: new Date().toISOString() })
        .eq("token_hash", tokenHash);

      return { userId: data.user_id };
    } catch (_error) {
      return { userId: null, error: "Failed to validate token" };
    }
  }

  // Try as regular Supabase access token
  try {
    const supabase = createMcpServiceRoleSupabaseClient();
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return { userId: null, error: "Invalid access token" };
    }

    return { userId: data.user.id };
  } catch (_error) {
    return { userId: null, error: "Failed to validate token" };
  }
}

export function resolveSession(): McpSession {
  return {
    accessToken:
      process.env.HINEAR_MCP_ACCESS_TOKEN?.trim() ||
      process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
      null,
    userId: process.env.HINEAR_MCP_USER_ID?.trim() || null,
  };
}
