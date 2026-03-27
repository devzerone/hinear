"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface IssuePanelProps {
  children: ReactNode;
  className?: string;
  padding?: "lg" | "md";
  shadow?: "elevated" | "soft";
}

const PADDING_STYLES = {
  lg: "p-5",
  md: "p-4",
} as const;

const SHADOW_STYLES = {
  elevated: "shadow-[0_18px_40px_rgba(15,23,42,0.08)]",
  soft: "",
} as const;

export function IssuePanel({
  children,
  className,
  padding = "md",
  shadow = "soft",
}: IssuePanelProps) {
  return (
    <section
      className={cn(
        "rounded-[16px] border border-[#E6E8EC] bg-white",
        PADDING_STYLES[padding],
        SHADOW_STYLES[shadow],
        className
      )}
    >
      {children}
    </section>
  );
}
