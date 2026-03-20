"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import type { Issue, IssueStatus } from "@/specs/issue-detail.contract";
import { IssueCard } from "./IssueCard";
import { KanbanColumn } from "./KanbanColumn";

const COLUMNS: IssueStatus[] = [
  "Triage",
  "Backlog",
  "Todo",
  "In Progress",
  "Done",
  "Canceled",
];

interface KanbanBoardProps {
  issues: Issue[];
  onIssueUpdate?: (issueId: string, updates: Partial<Issue>) => void;
}

export function KanbanBoard({ issues, onIssueUpdate }: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드 마운트 후 dnd-kit 활성화
  useEffect(() => {
    setMounted(true);
  }, []);

  // 드래그앤드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이상 드래그해야 드래그로 인식
      },
    })
  );

  // 이슈를 컬럼별로 그룹화
  const getIssuesByStatus = (status: IssueStatus) => {
    return issues.filter((issue) => issue.status === status);
  };

  // 드래그 시작 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find((i) => i.id === active.id);
    if (issue) {
      setActiveIssue(issue);
    }
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;

    // 상태가 실제로 변경되었는지 확인
    const issue = issues.find((i) => i.id === issueId);
    if (!issue || issue.status === newStatus) return;

    // 이슈 상태 업데이트
    onIssueUpdate?.(issueId, { status: newStatus });
  };

  if (!mounted) {
    return (
      <div className="h-full overflow-x-auto">
        <div className="flex min-h-full gap-3 p-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              issues={getIssuesByStatus(status)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex min-h-full gap-3 p-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              issues={getIssuesByStatus(status)}
            />
          ))}
        </div>

        {/* 드래그 중인 이슈 오버레이 */}
        <DragOverlay>
          {activeIssue && (
            <div className="rotate-2 opacity-90">
              <IssueCard issue={activeIssue} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
