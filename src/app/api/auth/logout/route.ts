import { type NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/request-origin";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

/**
 * Logout API - Signs out user and redirects to home
 */
export async function GET(_request: NextRequest) {
  const supabase = createServerSupabaseClient();

  await supabase.auth.signOut();

  const origin = await getRequestOrigin();
  return NextResponse.redirect(new URL("/auth", origin));
}
