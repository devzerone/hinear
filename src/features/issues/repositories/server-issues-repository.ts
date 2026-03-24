import "server-only";

import { cache } from "react";
import { SupabaseIssuesRepository } from "@/features/issues/repositories/supabase-issues-repository";
import { createRequestSupabaseServerClient } from "@/lib/supabase/server-client";

export const getServerIssuesRepository = cache(
  async () =>
    new SupabaseIssuesRepository(await createRequestSupabaseServerClient())
);
