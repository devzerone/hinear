"use client";

import { useIssues } from "../hooks/useIssues";
import { KanbanBoard } from "./KanbanBoard";

interface KanbanBoardViewProps {
  projectId: string;
}

export function KanbanBoardView({ projectId }: KanbanBoardViewProps) {
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

  return <KanbanBoard issues={issues} onIssueUpdate={updateIssue} />;
}
