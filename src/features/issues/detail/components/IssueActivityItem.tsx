"use client";

import { IssueDateMeta } from "@/features/issues/detail/components/IssueDateMeta";
import { cn } from "@/lib/utils";

interface IssueActivityItemProps {
  actorLabel?: string;
  className?: string;
  createdAt: string;
  dateLocale?: string;
  dateVariant?: "relative" | "timestamp";
  now?: number;
  summary: string;
  variant?: "card" | "plain";
}

export function IssueActivityItem({
  actorLabel,
  className,
  createdAt,
  dateLocale,
  dateVariant = "timestamp",
  now,
  summary,
  variant = "card",
}: IssueActivityItemProps) {
  return (
    <div
      className={cn(
        variant === "card"
          ? "rounded-[12px] border border-[#E6E8EC] bg-white px-4 py-3"
          : "",
        className
      )}
    >
      <p className="text-[12px] font-[var(--app-font-weight-700)] text-[#111318]">
        {summary}
      </p>
      {actorLabel ? (
        <p className="mt-1 text-[11px] font-[var(--app-font-weight-600)] text-[#374151]">
          {actorLabel}
        </p>
      ) : null}
      <p className="mt-1 text-[11px] text-[#6B7280]">
        <IssueDateMeta
          locale={dateLocale}
          now={now}
          value={createdAt}
          variant={dateVariant}
        />
      </p>
    </div>
  );
}
