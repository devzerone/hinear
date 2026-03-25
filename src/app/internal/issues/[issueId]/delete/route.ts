import { NextResponse } from "next/server";
import { deleteIssueAction } from "@/features/issues/actions/delete-issue-action";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";

interface RouteContext {
  params: Promise<{
    issueId: string;
  }>;
}

interface DeleteIssueBody {
  projectId: string;
}

export async function POST(request: Request, context: RouteContext) {
  const actorId = await getAuthenticatedActorIdOrNull();

  if (!actorId) {
    return NextResponse.json(
      {
        code: "AUTH_REQUIRED",
        error: "Authentication required.",
      },
      { status: 401 }
    );
  }

  const { issueId } = await context.params;
  const body = (await request.json().catch(() => null)) as DeleteIssueBody;

  if (!body?.projectId) {
    return NextResponse.json(
      { code: "INVALID_PROJECT", error: "Project ID is required." },
      { status: 400 }
    );
  }

  const result = await deleteIssueAction({
    issueId,
    projectId: body.projectId,
  });

  if (!result.success) {
    return NextResponse.json(
      { code: "DELETE_FAILED", error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
