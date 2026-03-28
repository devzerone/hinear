import "server-only";

import { cache } from "react";
import { SupabaseProjectMembersRepository } from "@/features/project-members/repositories/SupabaseProjectMembersRepository";
import { createRequestSupabaseServerClient } from "@/lib/supabase/server-client";

export const getServerProjectMembersRepository = cache(
  async () =>
    new SupabaseProjectMembersRepository(
      await createRequestSupabaseServerClient()
    )
);
