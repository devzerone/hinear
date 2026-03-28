import { requireApiActorId, requireProjectAccess } from "@/app/api/_lib/auth";
import { notFound, validationError } from "@/app/api/_lib/errors";
import {
  apiNoContent,
  apiV1Error,
  apiV1Success,
} from "@/app/api/_lib/response";
import { parseJsonBody } from "@/app/api/_lib/validation";
import { assertValidUpdateIssueInput } from "@/features/issues/lib/issue-validation";
import { toRestIssueResources } from "@/features/issues/presenters/issues-api-presenter";
import { getServerIssuesRepository } from "@/features/issues/repositories/server-issues-repository";

async function loadProjectIssue(projectId: string, issueId: string) {
  const repository = await getServerIssuesRepository();
  const issue = await repository.getIssueById(issueId);

  if (!issue || issue.projectId !== projectId) {
    throw notFound("Issue not found", {
      issueId,
      projectId,
    });
  }

  return {
    issue,
    repository,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ issueId: string; projectId: string }> }
) {
  try {
    const actorId = await requireApiActorId();
    const { issueId, projectId } = await params;
    await requireProjectAccess(projectId, actorId);
    const { issue } = await loadProjectIssue(projectId, issueId);

    return apiV1Success(toRestIssueResources([issue])[0]);
  } catch (error) {
    return apiV1Error(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ issueId: string; projectId: string }> }
) {
  try {
    const actorId = await requireApiActorId();
    const { issueId, projectId } = await params;
    await requireProjectAccess(projectId, actorId);
    const payload = await parseJsonBody<{
      assigneeId?: string | null;
      description?: string;
      dueDate?: string | null;
      priority?: import("@/features/issues/types").IssuePriority;
      status?: import("@/features/issues/types").IssueStatus;
      title?: string;
      version?: number;
    }>(request);
    const { repository } = await loadProjectIssue(projectId, issueId);

    const input = {
      assigneeId: payload.assigneeId,
      description: payload.description,
      dueDate: payload.dueDate,
      priority: payload.priority,
      status: payload.status,
      title: payload.title,
      updatedBy: actorId,
      version: payload.version ?? Number.NaN,
    };

    assertValidUpdateIssueInput(input);

    if (!Number.isInteger(input.version)) {
      throw validationError("version is required", {
        field: "version",
      });
    }

    const issue = await repository.updateIssue(issueId, input);

    return apiV1Success(toRestIssueResources([issue])[0]);
  } catch (error) {
    return apiV1Error(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ issueId: string; projectId: string }> }
) {
  try {
    const actorId = await requireApiActorId();
    const { issueId, projectId } = await params;
    await requireProjectAccess(projectId, actorId);
    const { repository } = await loadProjectIssue(projectId, issueId);
    await repository.deleteIssue({
      deletedBy: actorId,
      issueId,
    });

    return apiNoContent();
  } catch (error) {
    return apiV1Error(error);
  }
}
