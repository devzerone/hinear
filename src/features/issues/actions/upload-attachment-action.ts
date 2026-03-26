"use server";

import type {
  AttachmentUploadInput,
  AttachmentUploadResult,
} from "@/features/issues/contracts";
import { SupabaseIssueAttachmentsRepository } from "@/features/issues/repositories/supabase-attachments-repository";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";
import { createRequestSupabaseServerClient } from "@/lib/supabase/server-client";

export interface UploadAttachmentResult {
  success: boolean;
  data?: {
    publicUrl: string;
    filename: string;
    attachmentId: string;
  };
  error?: string;
}

export async function uploadAttachmentAction(
  formData: FormData
): Promise<UploadAttachmentResult> {
  const actorId = await getAuthenticatedActorIdOrNull();

  if (!actorId) {
    return { success: false, error: "Authentication required." };
  }

  try {
    const file = formData.get("file") as File;
    const issueId = formData.get("issueId") as string;
    const projectId = formData.get("projectId") as string;

    if (!file || !issueId || !projectId) {
      return { success: false, error: "Missing required fields." };
    }

    const client = await createRequestSupabaseServerClient();
    const repository = new SupabaseIssueAttachmentsRepository(client);

    const input: AttachmentUploadInput = {
      issueId,
      projectId,
      file,
      uploadedBy: actorId,
    };

    const result: AttachmentUploadResult =
      await repository.uploadAttachment(input);

    return {
      success: true,
      data: {
        publicUrl: result.publicUrl,
        filename: result.filename,
        attachmentId: result.attachmentId,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload attachment.",
    };
  }
}
