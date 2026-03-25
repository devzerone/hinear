import Link from "next/link";

import { IssueIdentifierBadge } from "@/features/issues/components/IssueIdentifierBadge";
import { IssueLabelChip } from "@/features/issues/components/IssueLabelChip";
import { IssuePriorityBadge } from "@/features/issues/components/IssuePriorityBadge";
import { IssueStatusBadge } from "@/features/issues/components/IssueStatusBadge";
import { getIssuePath } from "@/features/projects/lib/project-routes";
import type { Issue, IssueStatus } from "@/specs/issue-detail.contract";

const MOBILE_SECTION_ORDER: IssueStatus[] = ["Triage", "In Progress", "Done"];

export interface MobileIssueSectionsProps {
  issues: Issue[];
  projectId: string;
  statuses?: IssueStatus[];
}

function MobileIssueCard({
  issue,
  projectId,
}: {
  issue: Issue;
  projectId: string;
}) {
  return (
    <Link
      className="flex w-full flex-col gap-[10px] rounded-[14px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] p-3 transition-colors hover:bg-[#F7F8FA]"
      href={getIssuePath(projectId, issue.id, { view: "full" })}
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
  projectId,
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
                key={issue.id}
                projectId={projectId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
