import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  generateToken,
  hashToken,
  parseExpiration,
} from "../../../../../../../../mcp/hinear/src/lib/token-utils";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name = "MCP Token", expires_in = "90d" } = body;

    // Parse expiration
    const expiresAt = parseExpiration(expires_in);

    // Generate token
    const token = generateToken();
    const tokenHash = hashToken(token);

    // Insert into database
    const { data, error } = await supabase
      .from("mcp_access_tokens")
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        name,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return token (only on creation)
    return NextResponse.json({ token: data });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
