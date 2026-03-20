import { NextResponse } from "next/server";

import { toBoardIssue } from "@/features/issues/lib/issue-contract-adapter";
import { getServerIssuesRepository } from "@/features/issues/repositories/server-issues-repository";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  if (!(await getAuthenticatedActorIdOrNull())) {
    return NextResponse.json(
      {
        error: "Authentication required.",
      },
      { status: 401 }
    );
  }

  try {
    const { projectId } = await context.params;
    const repository = await getServerIssuesRepository();
    const issues = await repository.listIssuesByProject(projectId);

    return NextResponse.json({
      issues: issues.map(toBoardIssue),
      total: issues.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load issues.",
      },
      { status: 500 }
    );
  }
}
