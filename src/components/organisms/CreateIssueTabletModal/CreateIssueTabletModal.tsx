"use client";

import { X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/atoms/Button";
import { Field } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface CreateIssueTabletModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  action?: React.ComponentProps<"form">["action"];
  assigneeOptions?: SelectOption[];
  defaultDescription?: string;
  defaultLabels?: string;
  defaultPriority?: string;
  defaultStatus?: string;
  defaultTitle?: string;
  onCancel?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onClose?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  priorityOptions?: SelectOption[];
  statusOptions?: SelectOption[];
}

const DEFAULT_STATUS_OPTIONS: SelectOption[] = [
  { label: "Triage", value: "Triage" },
  { label: "Backlog", value: "Backlog" },
  { label: "Todo", value: "Todo" },
  { label: "In Progress", value: "In Progress" },
  { label: "Done", value: "Done" },
];

const DEFAULT_PRIORITY_OPTIONS: SelectOption[] = [
  { label: "No priority", value: "No Priority" },
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
  { label: "Urgent", value: "Urgent" },
];

const DEFAULT_ASSIGNEE_OPTIONS: SelectOption[] = [
  { label: "Assign to...", value: "" },
  { label: "Jane Smith", value: "jane-smith" },
  { label: "Alex Kim", value: "alex-kim" },
];

const TOOLBAR_ACTIONS = [
  { label: "H1", snippet: "# " },
  { label: "B", snippet: "**bold**" },
  { label: "</>", snippet: "`code`" },
  { label: "List", snippet: "- item" },
  { label: "Link", snippet: "[title](https://)" },
] as const;

function EditorToolButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-[8px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-surface-50)] px-2 py-[6px] text-[11px] leading-[11px] font-[var(--app-font-weight-600)] text-[var(--app-color-ink-900)]"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function CreateIssueTabletModal({
  action,
  assigneeOptions = DEFAULT_ASSIGNEE_OPTIONS,
  className,
  defaultDescription = "# 요약\n이슈의 핵심 내용을 짧게 적어주세요...\n\n- 기대 동작\n- 현재 문제\n- 배포 메모",
  defaultLabels = "",
  defaultPriority = "No Priority",
  defaultStatus = "Triage",
  defaultTitle = "",
  onCancel,
  onClose,
  onSubmit,
  priorityOptions = DEFAULT_PRIORITY_OPTIONS,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  ...props
}: CreateIssueTabletModalProps) {
  const [description, setDescription] = React.useState(defaultDescription);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function insertSnippet(snippet: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setDescription((current) => `${current}\n${snippet}`.trim());
      return;
    }

    const selectionStart = textarea.selectionStart ?? description.length;
    const selectionEnd = textarea.selectionEnd ?? description.length;

    setDescription((current) => {
      const nextValue =
        current.slice(0, selectionStart) +
        snippet +
        current.slice(selectionEnd);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = selectionStart + snippet.length;
        textarea.setSelectionRange(cursor, cursor);
      });

      return nextValue;
    });
  }

  return (
    <div
      className={cn(
        "w-[720px] rounded-[20px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)]",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[22px] leading-[22px] font-[var(--app-font-weight-600)] text-[var(--app-color-ink-900)]">
              Create issue
            </h2>
            <p className="mt-1 text-[13px] leading-[1.45] font-normal text-[var(--app-color-gray-500)]">
              board를 벗어나지 않고도 필요한 맥락을 빠르게 적을 수 있습니다.
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-surface-50)] text-[var(--app-color-gray-500)]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-[14px] w-[14px]" />
          </button>
        </div>

        <form
          action={action}
          className="flex flex-col gap-5 rounded-[16px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] p-6"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col gap-2">
            <label
              className="text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-black)]"
              htmlFor="create-issue-title"
            >
              Title
            </label>
            <Field
              defaultValue={defaultTitle}
              id="create-issue-title"
              name="title"
              placeholder="이슈 제목"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label
                className="text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-black)]"
                htmlFor="create-issue-status"
              >
                Status
              </label>
              <Select
                defaultValue={defaultStatus}
                id="create-issue-status"
                name="status"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-black)]"
                htmlFor="create-issue-priority"
              >
                Priority
              </label>
              <Select
                defaultValue={defaultPriority}
                id="create-issue-priority"
                name="priority"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-black)]"
                htmlFor="create-issue-assignee"
              >
                Assignee
              </label>
              <Select id="create-issue-assignee" name="assigneeId">
                {assigneeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-black)]"
              htmlFor="create-issue-labels"
            >
              Labels
            </label>
            <Field
              defaultValue={defaultLabels}
              id="create-issue-labels"
              name="labels"
              placeholder="라벨 추가..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-[13px] leading-[13px] font-[var(--app-font-weight-500)] text-[var(--app-color-black)]"
              htmlFor="create-issue-description"
            >
              Description
            </label>
            <p className="text-[12px] leading-[1.45] font-normal text-[var(--app-color-gray-500)]">
              Markdown으로 heading, list, link, code block을 작성할 수 있습니다.
            </p>

            <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--app-color-border-soft)] bg-[var(--app-color-white)] p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {TOOLBAR_ACTIONS.map((action) => (
                    <EditorToolButton
                      key={action.label}
                      label={action.label}
                      onClick={() => insertSnippet(action.snippet)}
                    />
                  ))}
                </div>
                <span className="rounded-full bg-[var(--app-color-brand-50)] px-[10px] py-[5px] text-[11px] leading-[11px] font-[var(--app-font-weight-600)] text-[var(--app-color-brand-700)]">
                  Markdown
                </span>
              </div>

              <textarea
                className="min-h-[108px] w-full rounded-[10px] bg-[var(--app-color-surface-0)] px-[14px] py-3 text-[13px] leading-[1.5] font-normal text-[var(--app-color-ink-900)] outline-none placeholder:text-[var(--app-color-gray-400)]"
                id="create-issue-description"
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="# 요약"
                ref={textareaRef}
                value={description}
              />

              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] leading-[11px] font-normal text-[var(--app-color-gray-400)]">
                  /로 code block, checklist, quote를 추가할 수 있습니다.
                </span>
                <span className="text-[11px] leading-[11px] font-[var(--app-font-weight-500)] text-[var(--app-color-gray-400)]">
                  Tab으로 들여쓰기
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-[10px]">
            <Button onClick={onCancel} type="button" variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create issue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
