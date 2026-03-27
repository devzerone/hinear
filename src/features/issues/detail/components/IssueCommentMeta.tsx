"use client";

import { IssueDateMeta } from "@/features/issues/detail/components/IssueDateMeta";
import { cn } from "@/lib/utils";

interface IssueCommentMetaProps {
  authorLabel: string;
  className?: string;
  createdAt: string;
  dateLocale?: string;
  dateVariant?: "relative" | "timestamp";
  now?: number;
}

export function IssueCommentMeta({
  authorLabel,
  className,
  createdAt,
  dateLocale,
  dateVariant = "timestamp",
  now,
}: IssueCommentMetaProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span className="text-[12px] font-[var(--app-font-weight-700)] text-[#111318]">
        {authorLabel}
      </span>
      <span className="text-[11px] text-[#6B7280]">
        <IssueDateMeta
          locale={dateLocale}
          now={now}
          value={createdAt}
          variant={dateVariant}
        />
      </span>
    </div>
  );
}
