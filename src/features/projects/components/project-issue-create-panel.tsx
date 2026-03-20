"use client";

import * as React from "react";

import { Button } from "@/components/atoms/Button";
import { CreateIssueTabletModal } from "@/components/organisms/CreateIssueTabletModal";

interface ProjectIssueCreatePanelProps {
  action: React.ComponentProps<"form">["action"];
  projectKey: string;
}

export function ProjectIssueCreatePanel({
  action,
  projectKey,
}: ProjectIssueCreatePanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="app-section-title">New issue</h2>
          <p className="app-muted">
            Open the richer create flow for {projectKey} without leaving the
            board.
          </p>
        </div>

        <div className="rounded-[18px] border border-[#C7D2FE] bg-[#FCFCFF] p-5">
          <div className="flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-[#111318]">
              Launch issue composer
            </h3>
            <p className="text-[13px] font-medium leading-5 text-[#4B5563]">
              Capture title, status, priority, assignee, labels, and a
              markdown-ready description in one place.
            </p>
            <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-[#4338CA]">
              <span className="rounded-full bg-[#EEF2FF] px-3 py-[6px]">
                Title + Description
              </span>
              <span className="rounded-full bg-[#EEF2FF] px-3 py-[6px]">
                Status + Priority
              </span>
              <span className="rounded-full bg-[#EEF2FF] px-3 py-[6px]">
                Labels + Assignee
              </span>
            </div>
            <div>
              <Button onClick={() => setIsOpen(true)} type="button">
                Create issue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(15,23,42,0.36)] px-4 py-10">
          <CreateIssueTabletModal
            action={action}
            className="max-h-[calc(100vh-80px)] overflow-y-auto"
            onCancel={() => setIsOpen(false)}
            onClose={() => setIsOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}
