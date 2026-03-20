"use client";

import { MobileIssueListAppBar } from "@/components/molecules/MobileIssueListAppBar";
import { LinearDashboardHeader } from "@/components/organisms/LinearDashboardHeader";
import { MobileIssueSections } from "@/components/organisms/MobileIssueSections";
import { useIssues } from "../hooks/useIssues";
import { KanbanBoard } from "./KanbanBoard";

interface KanbanBoardViewProps {
  projectId: string;
  projectKey?: string;
  projectName?: string;
}

export function KanbanBoardView({
  projectId,
  projectKey,
  projectName = "Project",
}: KanbanBoardViewProps) {
  const { issues, loading, error, updateIssue } = useIssues(projectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p className="font-medium">오류가 발생했습니다</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="md:hidden">
        <div className="flex flex-col gap-4">
          <MobileIssueListAppBar title={projectName} />
          <MobileIssueSections issues={issues} />
        </div>
      </div>
      <div className="hidden flex-col gap-6 md:flex">
        <LinearDashboardHeader
          eyebrow={projectKey ? `${projectName} / ${projectKey}` : projectName}
          issues={issues}
        />
        <div className="h-[760px] overflow-hidden rounded-[24px] border border-[var(--border)] bg-[#F7F8FA]">
          <KanbanBoard issues={issues} onIssueUpdate={updateIssue} />
        </div>
      </div>
    </div>
  );
}
