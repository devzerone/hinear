import "server-only";

import type { ProjectIssuesData } from "../containers/load-project-issues-container";

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

function getErrorStatus(code: string): number {
  const statusMap: Record<string, number> = {
    AUTH_REQUIRED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
  };

  return statusMap[code] || 500;
}
