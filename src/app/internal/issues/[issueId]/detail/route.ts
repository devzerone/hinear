import { NextResponse } from "next/server";
import { getServerIssuesRepository } from "@/features/issues/repositories/server-issues-repository";
import type { Issue } from "@/features/issues/types";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/features/issues/types";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";

interface RouteContext {
  params: Promise<{
    issueId: string;
  }>;
}

type IssueUpdateBody = Partial<
  Pick<Issue, "assigneeId" | "description" | "priority" | "status" | "title">
> & {
  version?: number;
};

function parseIssueUpdateBody(body: unknown): IssueUpdateBody {
  if (!body || typeof body !== "object") {
    return {};
  }

  const record = body as Record<string, unknown>;
  const updates: IssueUpdateBody = {};

  if (typeof record.title === "string") {
    updates.title = record.title;
  }

  if (
    typeof record.status === "string" &&
    ISSUE_STATUSES.includes(record.status as Issue["status"])
  ) {
    updates.status = record.status as Issue["status"];
  }

  if (
    typeof record.priority === "string" &&
    ISSUE_PRIORITIES.includes(record.priority as Issue["priority"])
  ) {
    updates.priority = record.priority as Issue["priority"];
  }

  if (typeof record.description === "string") {
    updates.description = record.description;
  }

  if (typeof record.assigneeId === "string" || record.assigneeId === null) {
    updates.assigneeId = record.assigneeId;
  }

  if (typeof record.version === "number" && Number.isInteger(record.version)) {
    updates.version = record.version;
  }

  return updates;
}

export async function PATCH(request: Request, context: RouteContext) {
  const actorId = await getAuthenticatedActorIdOrNull();

  if (!actorId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const updates = parseIssueUpdateBody(body);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No supported issue fields were provided." },
      { status: 400 }
    );
  }

  try {
    const { issueId } = await context.params;
    const repository = await getServerIssuesRepository();
    const version = updates.version;

    if (version === undefined) {
      return NextResponse.json(
        { error: "Version is required." },
        { status: 400 }
      );
    }

    const issue = await repository.updateIssue(issueId, {
      ...updates,
      updatedBy: actorId,
      version,
    });
    const activityLog = await repository.listActivityLogByIssueId(issueId);

    return NextResponse.json({
      issue,
      activityLog,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "CONFLICT"
    ) {
      return NextResponse.json(error, { status: 409 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to update issue.";
    const status = message === "Issue not found." ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
