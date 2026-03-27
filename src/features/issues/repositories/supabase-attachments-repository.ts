import "server-only";

import type {
  AttachmentUploadInput,
  AttachmentUploadResult,
  IssueAttachmentsRepository,
} from "@/features/issues/contracts";
import { createRepositoryError } from "@/features/issues/lib/repository-errors";
import type { AppSupabaseServerClient } from "@/lib/supabase/server-client";

export class SupabaseIssueAttachmentsRepository
  implements IssueAttachmentsRepository
{
  constructor(private readonly client: AppSupabaseServerClient) {}

  async uploadAttachment(
    input: AttachmentUploadInput
  ): Promise<AttachmentUploadResult> {
    const { issueId, file } = input;
    const attachmentId = crypto.randomUUID();
    const _fileExt = file.name.split(".").pop() ?? "png";
    const storagePath = `${issueId}/${attachmentId}/${file.name}`;

    // Validate file type
    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only PNG, JPEG, GIF, and WebP are allowed."
      );
    }

    // Validate file size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("File size exceeds 10MB limit.");
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await this.client.storage
      .from("issue-attachments")
      .upload(storagePath, file);

    if (uploadError) {
      throw createRepositoryError(
        "UNKNOWN",
        `Failed to upload attachment: ${uploadError.message}`
      );
    }

    // Get public URL
    const { data: urlData } = this.client.storage
      .from("issue-attachments")
      .getPublicUrl(storagePath);

    const result: AttachmentUploadResult = {
      storagePath,
      publicUrl: urlData.publicUrl,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      attachmentId,
    };

    return result;
  }

  async deleteAttachment(storagePath: string, _issueId: string): Promise<void> {
    const { error } = await this.client.storage
      .from("issue-attachments")
      .remove([storagePath]);

    if (error) {
      throw createRepositoryError(
        "UNKNOWN",
        `Failed to delete attachment: ${error.message}`
      );
    }
  }
}
