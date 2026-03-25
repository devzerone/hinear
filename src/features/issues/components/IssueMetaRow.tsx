"use client";

import type { ReactNode } from "react";

interface IssueMetaRowProps {
  className?: string;
  label: string;
  toneClassName?: string;
  value: ReactNode;
  variant?: "boxed" | "inline";
}

export function IssueMetaRow({
  className,
  label,
  toneClassName,
  value,
  variant = "inline",
}: IssueMetaRowProps) {
  if (variant === "boxed") {
    return (
      <div className={["flex flex-col gap-[6px]", className ?? ""].join(" ")}>
        <span className="text-[11px] font-semibold text-[#6B7280]">
          {label}
        </span>
        <div
          className={[
            "rounded-[10px] border border-[#E6E8EC] bg-white px-3 py-[10px] text-[13px] font-medium text-[#374151]",
            toneClassName ?? "",
          ].join(" ")}
        >
          {value}
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "flex items-center justify-between gap-3",
        className ?? "",
      ].join(" ")}
    >
      <span className="text-[11px] font-[var(--app-font-weight-600)] text-[#6B7280]">
        {label}
      </span>
      <div className={toneClassName ?? "text-[#111318]"}>{value}</div>
    </div>
  );
}
