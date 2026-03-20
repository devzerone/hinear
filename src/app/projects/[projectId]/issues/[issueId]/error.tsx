"use client";

import { useParams } from "next/navigation";

import { IssueDetailErrorScreen } from "@/features/issues/components/issue-detail-screen";

interface IssueDetailErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function IssueDetailErrorPage({
  error: _error,
  reset,
}: IssueDetailErrorPageProps) {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  return (
    <IssueDetailErrorScreen
      boardHref={projectId ? `/projects/${projectId}` : "/"}
      onRetry={reset}
    />
  );
}
