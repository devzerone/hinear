import { requireApiActorId, requireProjectOwner } from "@/app/api/_lib/auth";
import { notFound, validationError } from "@/app/api/_lib/errors";
import {
  apiNoContent,
  apiV1Error,
  apiV1Success,
} from "@/app/api/_lib/response";
import { parseJsonBody } from "@/app/api/_lib/validation";
import { assertProjectKey } from "@/features/projects/lib/project-key";
import { getServerProjectsRepository } from "@/features/projects/repositories/server-projects-repository";
import { PROJECT_TYPES } from "@/features/projects/types";

function toProjectResource(
  project: NonNullable<
    Awaited<
      ReturnType<
        Awaited<
          ReturnType<typeof getServerProjectsRepository>
        >["getProjectById"]
      >
    >
  >
) {
  return {
    created_at: project.createdAt,
    id: project.id,
    key: project.key,
    name: project.name,
    type: project.type,
    updated_at: project.updatedAt,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actorId = await requireApiActorId();
    const { projectId } = await params;
    const repository = await getServerProjectsRepository();
    const hasAccess = await repository.checkProjectAccess(projectId, actorId);

    if (!hasAccess) {
      throw notFound("Project not found", { projectId });
    }

    const project = await repository.getProjectById(projectId);

    if (!project) {
      throw notFound("Project not found", { projectId });
    }

    return apiV1Success(toProjectResource(project));
  } catch (error) {
    return apiV1Error(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actorId = await requireApiActorId();
    const { projectId } = await params;
    const repository = await getServerProjectsRepository();
    await requireProjectOwner(projectId, actorId);

    const current = await repository.getProjectById(projectId);

    if (!current) {
      throw notFound("Project not found", { projectId });
    }

    const payload = await parseJsonBody<{
      key?: string;
      name?: string;
      type?: string;
    }>(request);

    const nextName = payload.name?.trim() || current.name;
    const nextKey = payload.key ? assertProjectKey(payload.key) : current.key;
    const nextType = payload.type
      ? PROJECT_TYPES.includes(payload.type as (typeof PROJECT_TYPES)[number])
        ? (payload.type as (typeof PROJECT_TYPES)[number])
        : undefined
      : current.type;

    if (!nextType) {
      throw validationError("type must be one of: personal, team", {
        field: "type",
        value: payload.type,
      });
    }

    const project = await repository.updateProject({
      key: nextKey,
      name: nextName,
      projectId,
      type: nextType,
    });

    return apiV1Success(toProjectResource(project));
  } catch (error) {
    return apiV1Error(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actorId = await requireApiActorId();
    const { projectId } = await params;
    const repository = await getServerProjectsRepository();
    await requireProjectOwner(projectId, actorId);
    await repository.deleteProject({
      deletedBy: actorId,
      projectId,
    });

    return apiNoContent();
  } catch (error) {
    return apiV1Error(error);
  }
}
