import { NextResponse } from "next/server";
import { deleteProjectAction } from "@/features/projects/actions/delete-project-action";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function POST(_request: Request, context: RouteContext) {
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

  const { projectId } = await context.params;

  try {
    await deleteProjectAction({ projectId });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        code: "DELETE_FAILED",
        error:
          error instanceof Error ? error.message : "Failed to delete project.",
      },
      { status: 500 }
    );
  }
}
