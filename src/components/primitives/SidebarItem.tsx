import * as React from "react";

import { cn } from "@/lib/utils";

type SidebarItemKind = "nav" | "project";

export interface SidebarItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: React.ReactNode;
  kind?: SidebarItemKind;
  label: string;
}

export const SidebarItem = React.forwardRef<
  HTMLButtonElement,
  SidebarItemProps
>(
  (
    {
      active = false,
      className,
      icon,
      kind = "nav",
      label,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isProject = kind === "project";

    return (
      <button
        className={cn(
          "flex w-[216px] items-center gap-2 rounded-[10px] px-3 py-2 text-left transition-colors",
          "font-[var(--app-font-family-base)]",
          active
            ? "border border-[var(--color-slate-800)] bg-[var(--color-ink-800)]"
            : "border border-transparent bg-[var(--color-ink-900)]",
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-color-brand-300)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        ref={ref}
        type={type}
        {...props}
      >
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center",
            active
              ? "text-[var(--app-color-brand-500)]"
              : "text-[var(--app-color-gray-500)]"
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "text-[14px] leading-[14px]",
            active
              ? "font-[var(--app-font-weight-600)] text-[var(--app-color-white)]"
              : isProject
                ? "font-normal text-[var(--color-slate-400)]"
                : "font-[var(--app-font-weight-500)] text-[var(--color-slate-400)]"
          )}
        >
          {label}
        </span>
      </button>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
