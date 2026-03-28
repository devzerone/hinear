import { requireApiActorId, requireProjectOwner } from "@/app/api/_lib/auth";
import { apiNoContent, apiV1Error } from "@/app/api/_lib/response";
import { getServerProjectMembersRepository } from "@/features/project-members/repositories/server-project-members-repository";

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ memberId: string; projectId: string }>;
  }
) {
  try {
    const actorId = await requireApiActorId();
    const { memberId, projectId } = await params;
    const repository = await getServerProjectMembersRepository();
    await requireProjectOwner(projectId, actorId);
    await repository.removeMember({
      projectId,
      removedBy: actorId,
      userId: memberId,
    });

    return apiNoContent();
  } catch (error) {
    return apiV1Error(error);
  }
}
