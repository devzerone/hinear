import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
    const { token_id } = body;

    // Revoke token (only if owned by user)
    const { error } = await supabase
      .from("mcp_access_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", token_id)
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Token not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      revoked_token_id: token_id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
