"use client";

import { useDraggable } from "@dnd-kit/core";
import { BoardIssueCard } from "@/components/BoardIssueCard";
import type { Issue } from "@/specs/issue-detail.contract";

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: issue.id,
  });

  return (
    <BoardIssueCard
      assignee={issue.assignee}
      className={[
        "cursor-grab transition-shadow active:cursor-grabbing",
        isDragging
          ? "opacity-50"
          : "opacity-100 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)]",
      ].join(" ")}
      estimate={undefined}
      issueKey={issue.identifier}
      issueTitle={issue.title}
      labels={issue.labels}
      priority={issue.priority}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    />
  );
}
