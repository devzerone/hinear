import "server-only";

import { SupabaseIssuesRepository } from "@/features/issues/repositories/supabase-issues-repository";
import { createRequestSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getServerIssuesRepository() {
  return new SupabaseIssuesRepository(
    await createRequestSupabaseServerClient()
  );
}
