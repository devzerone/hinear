import { NextResponse } from "next/server";
import { isRepositoryError } from "@/features/issues/lib/repository-errors";
import { getServerProjectsRepository } from "@/features/projects/repositories/server-projects-repository";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
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
  const repository = await getServerProjectsRepository();

  try {
    const project = await repository.getProjectById(projectId);

    if (!project) {
      return NextResponse.json(
        {
          code: "PROJECT_NOT_FOUND",
          error: "Project not found.",
        },
        { status: 404 }
      );
    }

    if (project.createdBy !== actorId) {
      return NextResponse.json(
        {
          code: "FORBIDDEN",
          error: "Only project owners can delete projects.",
        },
        { status: 403 }
      );
    }

    await repository.deleteProject({
      projectId,
      deletedBy: actorId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isRepositoryError(error)) {
      return NextResponse.json(
        {
          code: error.code,
          error: error.message,
        },
        { status: error.status }
      );
    }

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
