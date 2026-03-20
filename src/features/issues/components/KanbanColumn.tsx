"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Issue, IssueStatus } from "@/specs/issue-detail.contract";
import { IssueCard } from "./IssueCard";

interface KanbanColumnProps {
  status: IssueStatus;
  issues: Issue[];
}

const COLUMN_LABELS: Record<IssueStatus, string> = {
  Triage: "Triage",
  Backlog: "Backlog",
  Todo: "Todo",
  "In Progress": "In Progress",
  Done: "Done",
  Canceled: "Canceled",
};

const COLUMN_COLORS: Record<IssueStatus, string> = {
  Triage: "text-[#6B7280]",
  Backlog: "text-[#2563EB]",
  Todo: "text-[#B45309]",
  "In Progress": "text-[#5B21B6]",
  Done: "text-[#15803D]",
  Canceled: "text-[#B91C1C]",
};

export function KanbanColumn({ status, issues }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="w-[232px] flex-shrink-0">
      <div className="rounded-[14px] border border-[#ECEEF2] bg-[#F7F8FA] p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[#111318]">
              {COLUMN_LABELS[status]}
            </h3>
            <span
              className={`text-[12px] font-semibold ${COLUMN_COLORS[status]}`}
            >
              {issues.length}
            </span>
          </div>
        </div>

        <div ref={setNodeRef} className="flex min-h-[520px] flex-col gap-2">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}

          {issues.length === 0 && (
            <div className="rounded-[12px] border border-dashed border-[#D7DCE5] bg-white px-3 py-6 text-center text-[13px] font-medium text-[#9CA3AF]">
              No issues yet
            </div>
          )}

          <button
            className="mt-auto inline-flex h-11 items-center justify-center rounded-[12px] border border-[#D7DCE5] bg-white px-3 text-[13px] font-medium text-[#6B7280]"
            type="button"
          >
            + Add issue
          </button>
        </div>
      </div>
    </div>
  );
}
