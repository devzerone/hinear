"use server";

import type { ListCommentsInput } from "@/features/comments/contracts";
import { SupabaseCommentsRepository } from "@/features/comments/repositories/SupabaseCommentsRepository";
import type { Comment } from "@/features/comments/types";
import { createClient } from "@/lib/supabase/server-client";

export async function listCommentsAction(
  input: ListCommentsInput
): Promise<Comment[]> {
  const supabase = await createClient();
  const repository = new SupabaseCommentsRepository(supabase);

  return repository.listCommentsByIssueId(input);
}
