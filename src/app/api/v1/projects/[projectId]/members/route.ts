import {
  requireApiActorId,
  requireProjectAccess,
  requireProjectOwner,
} from "@/app/api/_lib/auth";
import { validationError } from "@/app/api/_lib/errors";
import {
  apiV1Created,
  apiV1Error,
  apiV1Success,
} from "@/app/api/_lib/response";
import {
  parseJsonBody,
  requireNonEmptyString,
} from "@/app/api/_lib/validation";
import { getServerProjectMembersRepository } from "@/features/project-members/repositories/server-project-members-repository";

function toMemberResource(member: {
  createdAt: string;
  projectId: string;
  role: string;
  userId: string;
}) {
  return {
    createdAt: member.createdAt,
    projectId: member.projectId,
    role: member.role,
    userId: member.userId,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actorId = await requireApiActorId();
    const { projectId } = await params;
    const repository = await getServerProjectMembersRepository();
    await requireProjectAccess(projectId, actorId);
    const members = await repository.listMembers({
      projectId,
    });

    return apiV1Success({
      items: members.map(toMemberResource),
    });
  } catch (error) {
    return apiV1Error(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const actorId = await requireApiActorId();
    const { projectId } = await params;
    const repository = await getServerProjectMembersRepository();
    await requireProjectOwner(projectId, actorId);
    const payload = await parseJsonBody<{ role?: string; userId?: string }>(
      request
    );
    const userId = requireNonEmptyString(payload.userId, "userId");
    const role =
      payload.role === "owner" || payload.role === "member"
        ? payload.role
        : undefined;

    if (!role) {
      throw validationError("role must be one of: owner, member", {
        field: "role",
        value: payload.role,
      });
    }

    const member = await repository.addMember({
      addedBy: actorId,
      projectId,
      role,
      userId,
    });

    return apiV1Created(
      toMemberResource(member),
      `/api/v1/projects/${projectId}/members/${member.userId}`
    );
  } catch (error) {
    return apiV1Error(error);
  }
}
