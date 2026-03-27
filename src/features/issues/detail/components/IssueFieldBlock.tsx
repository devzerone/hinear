"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface IssueFieldBlockProps {
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  label: string;
  labelClassName?: string;
}

export function IssueFieldBlock({
  bodyClassName,
  children,
  className,
  htmlFor,
  label,
  labelClassName,
}: IssueFieldBlockProps) {
  return (
    <div className={cn("flex flex-col gap-[6px]", className)}>
      <label
        className={cn(
          "text-[11px] leading-[11px] font-[var(--app-font-weight-600)] text-[#6B7280]",
          labelClassName
        )}
        htmlFor={htmlFor}
      >
        {label}
      </label>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
