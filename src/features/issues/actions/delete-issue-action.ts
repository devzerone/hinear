"use server";

import { revalidatePath } from "next/cache";
import {
  getMutationErrorMessage,
  getMutationErrorStatus,
  inferMutationErrorCode,
} from "@/features/issues/lib/mutation-error-messages";
import { getServerIssuesRepository } from "@/features/issues/repositories/server-issues-repository";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";

export interface DeleteIssueInput {
  issueId: string;
  projectId: string;
}

export async function deleteIssueAction(input: DeleteIssueInput) {
  const actorId = await getAuthenticatedActorIdOrNull();

  if (!actorId) {
    return {
      success: false,
      error: "Your session expired. Sign in again and retry.",
    };
  }

  try {
    const repository = await getServerIssuesRepository();

    // 먼저 이슈가 존재하는지 확인
    const issue = await repository.getIssueById(input.issueId);

    if (!issue) {
      return {
        success: false,
        error: "Issue not found",
      };
    }

    // 이슈 삭제
    await repository.deleteIssue({
      issueId: input.issueId,
      deletedBy: actorId,
    });

    // Revalidate the project page
    revalidatePath(`/projects/${input.projectId}`);
    return {
      success: true,
    };
  } catch (error) {
    const code = inferMutationErrorCode(error);
    return {
      success: false,
      error: getMutationErrorMessage({
        actionLabel: "issue",
        code,
        fallbackMessage: error instanceof Error ? error.message : null,
        status: getMutationErrorStatus(code),
      }),
    };
  }
}
