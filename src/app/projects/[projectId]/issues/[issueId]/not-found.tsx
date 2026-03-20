"use client";

import { useParams } from "next/navigation";

import { IssueDetailNotFoundScreen } from "@/features/issues/components/issue-detail-screen";

export default function IssueDetailNotFoundPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const boardHref = projectId ? `/projects/${projectId}` : "/";

  return (
    <IssueDetailNotFoundScreen
      boardHref={boardHref}
      createHref={projectId ? `${boardHref}#new-issue-form` : undefined}
    />
  );
}
