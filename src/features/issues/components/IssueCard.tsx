"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { Chip } from "@/components/primitives";
import type { Issue } from "@/specs/issue-detail.contract";

interface IssueCardProps {
  issue: Issue;
}

const PRIORITY_COLORS: Record<Issue["priority"], string> = {
  "No Priority": "bg-[#F3F4F6] text-[#374151]",
  Low: "bg-[#DBEAFE] text-[#1D4ED8]",
  Medium: "bg-[#FEF3C7] text-[#B45309]",
  High: "bg-[#FFEDD5] text-[#C2410C]",
  Urgent: "bg-[#FEE2E2] text-[#B91C1C]",
};

export function IssueCard({ issue }: IssueCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: issue.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        "cursor-grab rounded-[12px] border border-[#E6E8EC] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-shadow active:cursor-grabbing",
        isDragging
          ? "opacity-50"
          : "opacity-100 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)]",
      ].join(" ")}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-[12px] font-semibold text-[#5E6AD2]">
          {issue.identifier}
        </div>
        <GripVertical className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
      </div>

      <h4 className="mb-3 text-[14px] font-semibold leading-5 text-[#111318]">
        {issue.title}
      </h4>

      {issue.labels.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {issue.labels.map((label) => (
            <Chip
              key={label.id}
              className="px-2 py-1 text-[12px]"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
              }}
            >
              {label.name}
            </Chip>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span
          className={[
            "rounded-full px-2.5 py-1 text-[12px] font-semibold",
            PRIORITY_COLORS[issue.priority],
          ].join(" ")}
        >
          {issue.priority}
        </span>

        {issue.assignee && (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#60A5FA] to-[#5E6AD2] text-[12px] font-semibold text-white"
            title={issue.assignee.name}
          >
            {issue.assignee.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
