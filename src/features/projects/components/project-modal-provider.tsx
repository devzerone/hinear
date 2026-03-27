"use client";

import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  fetchIssueDetail,
  getCachedIssueDetail,
} from "@/features/issues/lib/issue-detail-client-cache";
import { updateIssueDrawerUrl } from "@/features/issues/lib/issue-drawer-url";
import type { ActivityLogEntry, Issue, Label } from "@/features/issues/types";

const IssueDetailDrawerWithRouter = dynamic(
  () =>
    import("@/features/issues/components/issue-drawer-with-router").then(
      (module) => ({
        default: module.IssueDetailDrawerWithRouter,
      })
    ),
  {
    loading: () => null,
    ssr: false,
  }
);

interface ModalData {
  activityLog: ActivityLogEntry[];
  availableLabels: Label[];
  assigneeOptions: Array<{ label: string; value: string }>;
  issue: Issue;
  memberNamesById: Record<string, string>;
  projectId: string;
  issueId: string;
}

export function ProjectModalProvider({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const issueId = searchParams.get("issueId");
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const closeDrawer = useCallback(() => {
    updateIssueDrawerUrl(pathname, searchParams, null, "replace");
  }, [pathname, searchParams]);

  // Fetch issue data when issueId changes
  useEffect(() => {
    if (!issueId) {
      setModalData(null);
      return;
    }

    const currentIssueId = issueId;
    const cached = getCachedIssueDetail(projectId, currentIssueId);

    if (cached) {
      setModalData({
        activityLog: cached.activityLog,
        availableLabels: cached.availableLabels,
        assigneeOptions: [
          { label: "Unassigned", value: "" },
          ...cached.assigneeOptions,
        ],
        issue: cached.issue,
        memberNamesById: cached.memberNamesById,
        projectId,
        issueId: currentIssueId,
      });
    }

    async function loadModalData() {
      try {
        const data = await fetchIssueDetail(projectId, currentIssueId);

        setModalData({
          activityLog: data.activityLog || [],
          availableLabels: data.availableLabels || [],
          assigneeOptions: [
            { label: "Unassigned", value: "" },
            ...(data.assigneeOptions || []),
          ],
          issue: data.issue,
          memberNamesById: data.memberNamesById || {},
          projectId,
          issueId: currentIssueId,
        });
      } catch (error) {
        console.error("Failed to load issue:", error);
        closeDrawer();
      }
    }

    loadModalData();
  }, [closeDrawer, issueId, projectId]);

  return (
    modalData && (
      <IssueDetailDrawerWithRouter
        key={modalData.issueId}
        availableLabels={modalData.availableLabels}
        boardHref={`/projects/${projectId}`}
        fullPageHref={`/projects/${projectId}/issues/${modalData.issueId}?view=full`}
        activityLog={modalData.activityLog}
        assigneeOptions={modalData.assigneeOptions}
        issue={modalData.issue}
        memberNamesById={modalData.memberNamesById}
        onClose={closeDrawer}
      />
    )
  );
}
