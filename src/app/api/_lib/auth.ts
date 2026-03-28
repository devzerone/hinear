import { forbidden, notFound } from "@/app/api/_lib/errors";
import { getServerProjectsRepository } from "@/features/projects/repositories/server-projects-repository";
import {
  getAuthenticatedActorIdOrNull,
  requireAuthenticatedActorId,
} from "@/lib/supabase/server-auth";

export async function getOptionalApiActorId() {
  return getAuthenticatedActorIdOrNull();
}

export async function requireApiActorId() {
  return requireAuthenticatedActorId();
}

export async function requireProjectAccess(projectId: string, actorId: string) {
  const repository = await getServerProjectsRepository();
  const hasAccess = await repository.checkProjectAccess(projectId, actorId);

  if (!hasAccess) {
    throw forbidden("You do not have access to this project", { projectId });
  }
}

export async function requireProjectOwner(projectId: string, actorId: string) {
  const repository = await getServerProjectsRepository();
  const members = await repository.listProjectMembers(projectId);
  const actorMembership = members.find((member) => member.id === actorId);

  if (!actorMembership) {
    throw notFound("Project not found", { projectId });
  }

  if (actorMembership.role !== "owner") {
    throw forbidden("Only project owners can perform this action", {
      projectId,
    });
  }
}
