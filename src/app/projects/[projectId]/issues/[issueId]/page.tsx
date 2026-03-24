import { createIssueAction } from "@/features/issues/actions/create-issue-action";
import { IssueDetailFullPageScreen } from "@/features/issues/components/issue-detail-full-page-screen";
import { IssueDetailDrawerScreen } from "@/features/issues/components/issue-drawer-screen";
import { loadIssueDetail } from "@/features/issues/lib/issue-detail-loader";
import { inviteProjectMemberAction } from "@/features/projects/actions/invite-project-member-action";
import { manageProjectInvitationAction } from "@/features/projects/actions/manage-project-invitation-action";
import { manageProjectMemberAction } from "@/features/projects/actions/manage-project-member-action";
import { ProjectWorkspaceScreen } from "@/features/projects/components/project-workspace-screen";
import { loadProjectWorkspace } from "@/features/projects/lib/load-project-workspace";

interface IssueDetailPageProps {
  params: Promise<{
    projectId: string;
    issueId: string;
  }>;
  searchParams: Promise<{
    view?: string;
  }>;
}

export default async function IssueDetailPage({
  params,
  searchParams,
}: IssueDetailPageProps) {
  const { issueId, projectId } = await params;
  const { view = "drawer" } = await searchParams;

  // Load workspace data
  const workspace = await loadProjectWorkspace(
    projectId,
    `/projects/${projectId}/issues/${issueId}`
  );

  // Load issue detail data
  const issueDetail = await loadIssueDetail(
    projectId,
    issueId,
    `/projects/${projectId}/issues/${issueId}`
  );

  const assigneeOptions = [
    { label: "Unassigned", value: "" },
    ...issueDetail.members.map((member: { id: string; name: string }) => ({
      label: member.name,
      value: member.id,
    })),
  ];

  const memberNamesById: Record<string, string> = {};
  for (const member of issueDetail.members) {
    memberNamesById[member.id] = member.name;
  }

  // Render based on view parameter
  if (view === "full") {
    return (
      <IssueDetailFullPageScreen
        activityLog={issueDetail.activityLog}
        assigneeOptions={assigneeOptions}
        boardHref={`/projects/${projectId}`}
        comments={issueDetail.comments}
        issue={issueDetail.issue}
        memberNamesById={memberNamesById}
      />
    );
  }

  // Default: drawer view with workspace
  return (
    <>
      <ProjectWorkspaceScreen
        action={createIssueAction.bind(null, projectId)}
        inviteAction={inviteProjectMemberAction.bind(null, projectId)}
        invitationAction={manageProjectInvitationAction.bind(null, projectId)}
        memberAction={manageProjectMemberAction.bind(null, projectId)}
        invitations={workspace.invitations}
        members={workspace.members}
        project={workspace.project}
        projects={workspace.accessibleProjects}
        summary={workspace.summary}
      />
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-[688px] animate-in slide-in-from-right duration-300">
        <IssueDetailDrawerScreen
          activityLog={issueDetail.activityLog}
          assigneeOptions={assigneeOptions}
          boardHref={`/projects/${projectId}`}
          fullPageHref={`/projects/${projectId}/issues/${issueId}?view=full`}
          issue={issueDetail.issue}
          memberNamesById={memberNamesById}
        />
      </div>
    </>
  );
}
