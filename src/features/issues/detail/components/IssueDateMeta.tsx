"use client";

import {
  formatIssueCompactDate,
  formatIssueRelativeTime,
  formatIssueTimestamp,
} from "@/features/issues/lib/date-format";
import { cn } from "@/lib/utils";

interface IssueDateMetaProps {
  className?: string;
  locale?: string;
  now?: number;
  value: string;
  variant?: "compact" | "relative" | "timestamp";
}

export function IssueDateMeta({
  className,
  locale,
  now,
  value,
  variant = "timestamp",
}: IssueDateMetaProps) {
  const formattedValue =
    variant === "compact"
      ? formatIssueCompactDate(value)
      : variant === "relative"
        ? formatIssueRelativeTime(value, now, locale)
        : formatIssueTimestamp(value);

  return <span className={cn(className)}>{formattedValue}</span>;
}
