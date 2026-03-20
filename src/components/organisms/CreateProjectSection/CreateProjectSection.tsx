import type * as React from "react";

import {
  CreateProjectFormCard,
  CreateProjectNextStepsCard,
} from "@/features/projects/components/project-operation-cards";
import type { ProjectType } from "@/features/projects/types";
import { cn } from "@/lib/utils";

export interface CreateProjectSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  action?: (formData: FormData) => void | Promise<void>;
  defaultType?: ProjectType;
}

export function CreateProjectSection({
  action,
  className,
  defaultType = "team",
  ...props
}: CreateProjectSectionProps) {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-6 rounded-[28px] border border-[var(--app-color-border-muted,#E8EBF2)] bg-[#FBFBFD] p-8",
        className
      )}
      {...props}
    >
      <h2 className="font-display text-[26px] leading-[1.1] font-[var(--app-font-weight-700)] text-[var(--app-color-ink-900)]">
        Create Project Blocks
      </h2>

      <div className="grid gap-6 xl:grid-cols-[728px_392px]">
        <CreateProjectFormCard action={action} defaultType={defaultType} />
        <CreateProjectNextStepsCard projectType={defaultType} />
      </div>
    </section>
  );
}
