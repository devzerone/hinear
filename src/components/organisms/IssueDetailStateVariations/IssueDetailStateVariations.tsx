import type * as React from "react";

import { Button } from "@/components/atoms/Button";
import { Chip } from "@/components/atoms/Chip";
import { cn } from "@/lib/utils";

interface IssueDetailStateVariationsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function StateCard({
  children,
  className,
  title,
  widthClassName,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  widthClassName: string;
}) {
  return (
    <section
      className={cn(
        "flex shrink-0 flex-col gap-3 rounded-[20px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] p-5",
        widthClassName,
        className
      )}
    >
      <h3 className="text-[20px] leading-[1.1] font-[var(--app-font-weight-700)] text-[var(--app-color-ink-900)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SectionHeader({
  body,
  title,
  widthClassName,
}: {
  body: string;
  title: string;
  widthClassName: string;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <h2 className="text-[24px] leading-[1.1] font-[var(--app-font-weight-700)] text-[var(--app-color-ink-900)]">
        {title}
      </h2>
      <p
        className={cn(
          "text-[13px] leading-[1.45] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-600)]",
          widthClassName
        )}
      >
        {body}
      </p>
    </div>
  );
}

function LoadingStateCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <StateCard
      title="Loading"
      widthClassName={mobile ? "w-[393px]" : "w-[520px]"}
    >
      <p className="text-[13px] leading-[1.45] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-600)]">
        Issue data is being fetched. Replace controls with skeletons and disable
        edits.
      </p>
      <div className="h-[14px] w-[180px] rounded-full bg-[var(--app-color-gray-200)]" />
      <div className="h-11 w-full rounded-[12px] bg-[var(--app-color-gray-100)]" />
      <div className="h-[180px] w-full rounded-[16px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-surface-50)]" />
    </StateCard>
  );
}

function ErrorStateCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <StateCard
      title="Error"
      widthClassName={mobile ? "w-[393px]" : "w-[520px]"}
      className="text-[var(--color-orange-800)]"
    >
      <div className="flex flex-col gap-2 rounded-[14px] border border-[var(--color-orange-300)] bg-[var(--color-orange-50)] px-[18px] py-4">
        <p className="text-[16px] leading-[1.25] font-[var(--app-font-weight-700)] text-[var(--color-orange-800)]">
          We couldn&apos;t load this issue
        </p>
        <p className="text-[13px] leading-[1.45] font-[var(--app-font-weight-500)] text-[var(--color-orange-900)]">
          Show retry and back-to-board actions. Roll back optimistic edits
          before allowing further changes.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button>Retry</Button>
        <Button variant="secondary">Back to board</Button>
      </div>
    </StateCard>
  );
}

function NotFoundStateCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <StateCard
      title="Not Found"
      widthClassName={mobile ? "w-[393px]" : "w-[520px]"}
    >
      <p className="text-[13px] leading-[1.45] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-600)]">
        The requested issue no longer exists. Offer a clear way back to the
        board and a replacement create path.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button className="border-[var(--app-color-ink-900)] bg-[var(--app-color-ink-900)] hover:border-[var(--app-color-ink-900)] hover:bg-[var(--app-color-ink-900)]">
          Back to board
        </Button>
        <Button variant="secondary">Create issue</Button>
      </div>
    </StateCard>
  );
}

function EmptyFieldsStateCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <StateCard
      title="Unassigned / No Labels"
      widthClassName={mobile ? "w-[393px]" : "w-[520px]"}
    >
      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <span className="text-[11px] leading-[11px] font-[var(--app-font-weight-600)] text-[var(--app-color-gray-500)]">
            Status
          </span>
          <div className="rounded-[10px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] px-3 py-[10px] text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-700)]">
            Triage
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <span className="text-[11px] leading-[11px] font-[var(--app-font-weight-600)] text-[var(--app-color-gray-500)]">
            Assignee
          </span>
          <div className="rounded-[10px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] px-3 py-[10px] text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-400)]">
            Unassigned
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-[12px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-surface-0)] px-[14px] py-3">
        <span className="text-[12px] leading-[12px] font-[var(--app-font-weight-600)] text-[var(--app-color-gray-500)]">
          Labels
        </span>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-400)]">
            No labels selected
          </span>
          <button
            className="text-[12px] leading-[12px] font-[var(--app-font-weight-700)] text-[var(--app-color-brand-700)]"
            type="button"
          >
            + Add label
          </button>
        </div>
      </div>
    </StateCard>
  );
}

function SavingStateCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <StateCard
      title="Saving"
      widthClassName={mobile ? "w-[393px]" : "w-[520px]"}
    >
      <p className="text-[13px] leading-[1.45] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-600)]">
        Show field-level pending feedback while keeping unrelated controls
        usable.
      </p>
      <div className="flex flex-col gap-2 rounded-[14px] border border-[var(--app-color-brand-200)] bg-[var(--app-color-surface-0)] px-4 py-[14px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] leading-[12px] font-[var(--app-font-weight-600)] text-[var(--app-color-gray-500)]">
            Title
          </span>
          <Chip
            className="font-[var(--app-font-weight-700)]"
            size="sm"
            variant="accent"
          >
            Saving...
          </Chip>
        </div>
        <p
          className={cn(
            "text-[18px] leading-[1.25] font-[var(--app-font-weight-600)] text-[var(--app-color-ink-900)]",
            mobile && "text-[16px]"
          )}
        >
          사용자 인증 플로우 구현
        </p>
      </div>
    </StateCard>
  );
}

export function IssueDetailStateVariations({
  className,
  ...props
}: IssueDetailStateVariationsProps) {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-10 bg-[var(--app-color-surface-0)] px-8 py-6",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          body="Reference layouts for loading, error, not-found, and empty field states on desktop issue detail."
          title="Desktop Variations"
          widthClassName="max-w-[720px]"
        />
        <div className="flex flex-wrap gap-6">
          <LoadingStateCard />
          <ErrorStateCard />
          <NotFoundStateCard />
          <EmptyFieldsStateCard />
          <SavingStateCard />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SectionHeader
          body="Compact card-stack references for the same states in the mobile detail flow."
          title="Mobile Variations"
          widthClassName="max-w-[640px]"
        />
        <div className="flex flex-wrap gap-5">
          <LoadingStateCard mobile />
          <ErrorStateCard mobile />
          <NotFoundStateCard mobile />
          <EmptyFieldsStateCard mobile />
          <SavingStateCard mobile />
        </div>
      </div>
    </section>
  );
}
