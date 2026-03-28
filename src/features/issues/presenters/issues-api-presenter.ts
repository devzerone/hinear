import "server-only";

import type { ProjectIssuesData } from "../containers/load-project-issues-container";
import type { Issue, IssuePriority, IssueStatus } from "../types";

/**
 * Presenter: 응답 포맷팅 로직 담당
 * - 데이터를 API 응답 형식으로 변환
 * - 에러 처리 및 상태 코드 결정
 */
export const IssuesApiPresenter = {
  presentSuccess(data: ProjectIssuesData): Response {
    return Response.json({
      issues: data.issues,
      total: data.total,
    });
  },

  presentAuthRequired(): Response {
    return Response.json(
      {
        code: "AUTH_REQUIRED",
        error: "Authentication required.",
      },
      { status: 401 }
    );
  },

  presentError(error: Error & { code?: string }): Response {
    const code = error.code || "UNKNOWN";
    const message = error.message || "Failed to load issues.";

    // 에러 코드에 따른 상태 코드 결정
    const status = getErrorStatus(code);

    return Response.json(
      {
        code,
        error: message,
      },
      { status }
    );
  },
};

export interface RestIssueResource {
  createdAt: string;
  description: string;
  id: string;
  identifier: string;
  priority: IssuePriority;
  projectId: string;
  status: IssueStatus;
  title: string;
  updatedAt: string;
  version: number;
}

export function toRestIssueResource(issue: Issue): RestIssueResource {
  return {
    createdAt: issue.createdAt,
    description: issue.description,
    id: issue.id,
    identifier: issue.identifier,
    priority: issue.priority,
    projectId: issue.projectId,
    status: issue.status,
    title: issue.title,
    updatedAt: issue.updatedAt,
    version: issue.version,
  };
}

export function toRestIssueResources(issues: Issue[]) {
  return issues.map(toRestIssueResource);
}

function getErrorStatus(code: string): number {
  const statusMap: Record<string, number> = {
    AUTH_REQUIRED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
  };

  return statusMap[code] || 500;
}
