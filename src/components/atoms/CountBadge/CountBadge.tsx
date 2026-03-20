import type * as React from "react";

import { cn } from "@/lib/utils";

export interface CountBadgeProps
  extends Omit<
    React.HTMLAttributes<HTMLSpanElement>,
    "aria-label" | "children"
  > {
  count: number;
}

function formatCount(count: number) {
  if (count > 99) {
    return "99";
  }

  return String(count);
}

export function CountBadge({
  className,
  count,
  title,
  ...props
}: CountBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] text-center text-[10px] leading-none font-[var(--app-font-weight-600)] text-[var(--app-color-gray-500)]",
        className
      )}
      title={title ?? String(count)}
      {...props}
    >
      {formatCount(count)}
    </span>
  );
}
