"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface IssueSectionHeaderProps {
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  subtitle?: ReactNode;
  title: string;
  titleClassName?: string;
}

export function IssueSectionHeader({
  actions,
  badge,
  className,
  subtitle,
  title,
  titleClassName,
}: IssueSectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className={cn("text-[#111318]", titleClassName)}>{title}</h2>
        {subtitle ? <div className="mt-1">{subtitle}</div> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {badge}
        {actions}
      </div>
    </div>
  );
}
