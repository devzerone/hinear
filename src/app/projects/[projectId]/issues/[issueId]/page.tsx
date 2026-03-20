import { notFound, redirect } from "next/navigation";
import { buildAuthPath } from "@/features/auth/lib/next-path";
import { IssueDetailScreen } from "@/features/issues/components/issue-detail-screen";
import { getServerIssuesRepository } from "@/features/issues/repositories/server-issues-repository";
import { getAuthenticatedActorIdOrNull } from "@/lib/supabase/server-auth";

interface IssueDetailPageProps {
  params: Promise<{
    projectId: string;
    issueId: string;
  }>;
}

export default async function IssueDetailPage({
  params,
}: IssueDetailPageProps) {
  const { projectId, issueId } = await params;

  if (!(await getAuthenticatedActorIdOrNull())) {
    redirect(buildAuthPath(`/projects/${projectId}/issues/${issueId}`));
  }

  const repository = await getServerIssuesRepository();
  const issue = await repository.getIssueById(issueId);

  if (!issue || issue.projectId !== projectId) {
    notFound();
  }

  const [comments, activityLog] = await Promise.all([
    repository.listCommentsByIssueId(issueId),
    repository.listActivityLogByIssueId(issueId),
  ]);

  return (
    <IssueDetailScreen
      activityLog={activityLog}
      boardHref={`/projects/${projectId}`}
      comments={comments}
      createHref={`/projects/${projectId}#new-issue-form`}
      issue={issue}
    />
  );
}
