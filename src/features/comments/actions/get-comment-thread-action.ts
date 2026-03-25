"use server";

import type { GetCommentThreadInput } from "@/features/comments/contracts";
import { SupabaseCommentsRepository } from "@/features/comments/repositories/SupabaseCommentsRepository";
import type { CommentThread } from "@/features/comments/types";
import { createClient } from "@/lib/supabase/server-client";

export async function getCommentThreadAction(
  input: GetCommentThreadInput
): Promise<CommentThread> {
  const supabase = await createClient();
  const repository = new SupabaseCommentsRepository(supabase);

  return repository.getCommentThread(input);
}
