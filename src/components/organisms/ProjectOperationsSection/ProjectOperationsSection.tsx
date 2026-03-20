import type * as React from "react";

import {
  InvitationAcceptCard,
  ProjectAccessCard,
} from "@/features/projects/components/project-operation-cards";
import type {
  ProjectInvitationStatus,
  ProjectMemberRole,
  ProjectType,
} from "@/features/projects/types";
import { cn } from "@/lib/utils";

interface ProjectAccessMember {
  id: string;
  name: string;
  role: ProjectMemberRole;
  note: string;
  isCurrentUser?: boolean;
  canRemove?: boolean;
}

export interface ProjectOperationsSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  acceptHref?: string;
  declineHref?: string;
  expiresAt?: string;
  inviteValue?: string;
  invitedBy?: string;
  invitationStatus?: ProjectInvitationStatus;
  members?: ProjectAccessMember[];
  projectName?: string;
  projectType?: ProjectType;
}

export function ProjectOperationsSection({
  acceptHref = "/projects/new",
  className,
  declineHref = "/",
  expiresAt = "Mar 27, 2026",
  inviteValue = "teammate@hinear.app",
  invitedBy = "Alex Kim",
  invitationStatus = "pending",
  members,
  projectName = "Hinear",
  projectType = "team",
  ...props
}: ProjectOperationsSectionProps) {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-6 rounded-[28px] border border-[var(--app-color-border-muted,#E6E8EC)] bg-[#FAFBFD] p-8",
        className
      )}
      {...props}
    >
      <h2 className="font-display text-[26px] leading-[1.1] font-[var(--app-font-weight-700)] text-[var(--app-color-ink-900)]">
        Project Access & Invitations
      </h2>

      <div className="grid gap-6 xl:grid-cols-[920px_560px]">
        <ProjectAccessCard inviteValue={inviteValue} members={members} />
        <InvitationAcceptCard
          acceptHref={acceptHref}
          declineHref={declineHref}
          expiresAt={expiresAt}
          invitedBy={invitedBy}
          projectName={projectName}
          projectType={projectType}
          status={invitationStatus}
        />
      </div>
    </section>
  );
}
