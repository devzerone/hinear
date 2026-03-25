"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface IssueEmptyStateProps {
  children?: ReactNode;
  className?: string;
  message: string;
}

export function IssueEmptyState({
  children,
  className,
  message,
}: IssueEmptyStateProps) {
  return (
    <div className={cn(className)}>
      <span>{message}</span>
      {children}
    </div>
  );
}
