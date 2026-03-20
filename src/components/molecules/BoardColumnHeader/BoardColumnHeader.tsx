import * as React from "react";

import { CountBadge } from "@/components/atoms/CountBadge";
import { cn } from "@/lib/utils";

export interface BoardColumnHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  title: string;
}

export const BoardColumnHeader = React.forwardRef<
  HTMLDivElement,
  BoardColumnHeaderProps
>(({ className, count, title, ...props }, ref) => {
  return (
    <div
      className={cn("flex items-center justify-between gap-3", className)}
      ref={ref}
      {...props}
    >
      <h3 className="text-[14px] leading-[14px] font-[var(--app-font-weight-600)] text-[var(--app-color-ink-900)]">
        {title}
      </h3>
      <CountBadge count={count} />
    </div>
  );
});

BoardColumnHeader.displayName = "BoardColumnHeader";
