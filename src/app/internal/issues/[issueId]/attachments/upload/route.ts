import { NextResponse } from "next/server";

import type {
  AttachmentUploadInput,
  AttachmentUploadResult,
} from "@/features/issues/contracts";
import { SupabaseIssueAttachmentsRepository } from "@/features/issues/repositories/supabase-attachments-repository";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";
import { createRequestSupabaseServerClient } from "@/lib/supabase/server-client";

interface RouteContext {
  params: Promise<{
    issueId: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  const actorId = await getAuthenticatedActorIdOrNull();

  if (!actorId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;
    const { issueId } = await context.params;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      data: {
        publicUrl: result.publicUrl,
        filename: result.filename,
        attachmentId: result.attachmentId,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload attachment.",
      },
      { status: 500 }
    );
  }
}
