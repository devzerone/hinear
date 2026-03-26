import Link from "next/link";
import type { MouseEvent, PointerEvent } from "react";
import { useRef } from "react";

import { IssueIdentifierBadge } from "@/features/issues/components/IssueIdentifierBadge";
import { IssueLabelChip } from "@/features/issues/components/IssueLabelChip";
import { IssuePriorityBadge } from "@/features/issues/components/IssuePriorityBadge";
import { IssueStatusBadge } from "@/features/issues/components/IssueStatusBadge";
import { getIssuePath } from "@/features/projects/lib/project-routes";
import type { Issue, IssueStatus } from "@/specs/issue-detail.contract";

const MOBILE_SECTION_ORDER: IssueStatus[] = ["Triage", "In Progress", "Done"];

export interface MobileIssueSectionsProps {
  issues: Issue[];
  onEnterSelectionMode?: (issueId: string) => void;
  onToggleSelect?: (issueId: string) => void;
  projectId: string;
  selectedIssueIds?: string[];
  selectionMode?: boolean;
  statuses?: IssueStatus[];
}

function MobileIssueCard({
  issue,
  isSelected = false,
  onEnterSelectionMode,
  onToggleSelect,
  projectId,
  selectionMode = false,
}: {
  issue: Issue;
  isSelected?: boolean;
  onEnterSelectionMode?: (issueId: string) => void;
  onToggleSelect?: (issueId: string) => void;
  projectId: string;
  selectionMode?: boolean;
}) {
  const longPressTimeoutRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearLongPress = () => {
    if (longPressTimeoutRef.current !== null) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (selectionMode || event.pointerType === "mouse") {
      return;
    }

    longPressTriggeredRef.current = false;
    longPressTimeoutRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      onEnterSelectionMode?.(issue.id);
    }, 360);
  };

  const handlePointerUp = () => {
    clearLongPress();
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (selectionMode) {
      event.preventDefault();
      onToggleSelect?.(issue.id);
      return;
    }

    if (longPressTriggeredRef.current) {
      event.preventDefault();
      longPressTriggeredRef.current = false;
    }
  };

  return (
    <Link
      className={`flex w-full flex-col gap-[10px] rounded-[14px] border bg-[var(--app-color-white)] p-3 transition-colors hover:bg-[#F7F8FA] ${
        isSelected
          ? "border-[#6366F1] shadow-[0_0_0_1px_#6366F1]"
          : "border-[var(--app-color-border-soft)]"
      }`}
      href={getIssuePath(projectId, issue.id, { view: "full" })}
      onClick={handleClick}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerUp}
      onPointerUp={handlePointerUp}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <IssueIdentifierBadge identifier={issue.identifier} size="sm" />
          <IssueStatusBadge size="sm" status={issue.status} />
        </div>
        <IssuePriorityBadge priority={issue.priority} size="sm" />
      </div>

      <p className="text-[13px] leading-[1.45] font-[var(--app-font-weight-500)] text-[var(--app-color-ink-900)]">
        {issue.title}
      </p>

      {issue.labels.length > 0 ? (
        <div className="flex flex-wrap gap-[6px]">
          {issue.labels.map((label) => (
            <IssueLabelChip key={label.id} label={label} size="sm" />
          ))}
        </div>
      ) : null}
    </Link>
  );
}

export function MobileIssueSections({
  issues,
  onEnterSelectionMode,
  onToggleSelect,
  projectId,
  selectedIssueIds = [],
  selectionMode = false,
  statuses = MOBILE_SECTION_ORDER,
}: MobileIssueSectionsProps) {
  const sections = statuses
    .map((status) => ({
      issues: issues.filter((issue) => issue.status === status),
      status,
    }))
    .filter((section) => section.issues.length > 0);

  if (sections.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] px-4 py-8 text-center text-[13px] leading-[1.45] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-400)]">
        No mobile issues yet
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-[14px]">
      {sections.map((section) => (
        <section className="flex w-full flex-col gap-2" key={section.status}>
          <div className="flex items-center justify-between gap-3">
            <IssueStatusBadge size="sm" status={section.status} />
            <span className="text-[12px] leading-[12px] font-[var(--app-font-weight-600)] text-[var(--app-color-gray-500)]">
              {section.issues.length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {section.issues.map((issue) => (
              <MobileIssueCard
                issue={issue}
                isSelected={selectedIssueIds.includes(issue.id)}
                key={issue.id}
                onEnterSelectionMode={onEnterSelectionMode}
                onToggleSelect={onToggleSelect}
                projectId={projectId}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
