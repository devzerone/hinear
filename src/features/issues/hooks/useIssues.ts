"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getMutationErrorCode,
  getMutationErrorFallbackMessage,
  getMutationErrorMessage,
} from "@/features/issues/lib/mutation-error-messages";
import type {
  Issue,
  IssuePriority,
  IssueStatus,
} from "@/specs/issue-detail.contract";

type IssueUpdateInput = Partial<
  Pick<Issue, "description" | "priority" | "status" | "title">
> & {
  assigneeId?: string | null;
};

interface UseIssuesOptions {
  assigneeIds?: string[];
  labelIds?: string[];
  priorities?: IssuePriority[];
  searchQuery?: string;
  statuses?: IssueStatus[];
}

function normalizeValues(values?: string[]) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function getIssueListPayload(value: unknown): Issue[] {
  if (
    value &&
    typeof value === "object" &&
    "issues" in value &&
    Array.isArray((value as { issues?: unknown }).issues)
  ) {
    return (value as { issues: Issue[] }).issues;
  }

  return [];
}

function getUpdatedIssuePayload(value: unknown): Issue | null {
  if (value && typeof value === "object" && "issue" in value) {
    return (value as { issue: Issue }).issue;
  }

  return null;
}

export function useIssues(projectId: string, options: UseIssuesOptions = {}) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mutationError, setMutationError] = useState<Error | null>(null);
  const searchQuery = options.searchQuery?.trim() ?? "";
  const statuses = normalizeValues(options.statuses);
  const priorities = normalizeValues(options.priorities);
  const assigneeIds = normalizeValues(options.assigneeIds);
  const labelIds = normalizeValues(options.labelIds);
  const shouldUseSearchApi =
    Boolean(searchQuery) ||
    statuses.length > 0 ||
    priorities.length > 0 ||
    assigneeIds.length > 0 ||
    labelIds.length > 0;
  const searchRequestBody = useMemo(
    () =>
      JSON.stringify({
        projectId,
        query: searchQuery || undefined,
        ...(assigneeIds.length > 0 ? { assigneeIds } : {}),
        ...(labelIds.length > 0 ? { labelIds } : {}),
        ...(priorities.length > 0 ? { priorities } : {}),
        ...(statuses.length > 0 ? { statuses } : {}),
      }),
    [assigneeIds, labelIds, priorities, projectId, searchQuery, statuses]
  );

  useEffect(() => {
    async function fetchIssues() {
      try {
        setLoading(true);
        setError(null);
        const response = shouldUseSearchApi
          ? await fetch("/api/issues/search", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: searchRequestBody,
            })
          : await fetch(`/internal/projects/${projectId}/issues`);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            getMutationErrorMessage({
              actionLabel: "board",
              code: getMutationErrorCode(payload),
              fallbackMessage: getMutationErrorFallbackMessage(payload),
              status: response.status,
            })
          );
        }

        setIssues(getIssueListPayload(payload));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, [projectId, searchRequestBody, shouldUseSearchApi]);

  const updateIssue = async (issueId: string, updates: IssueUpdateInput) => {
    try {
      setMutationError(null);
      const response = await fetch(`/internal/issues/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getMutationErrorMessage({
            actionLabel: "board",
            code: getMutationErrorCode(payload),
            fallbackMessage: getMutationErrorFallbackMessage(payload),
            status: response.status,
          })
        );
      }

      const updatedIssue = getUpdatedIssuePayload(payload);

      if (updatedIssue) {
        setIssues((prev) =>
          prev.map((issue) => (issue.id === issueId ? updatedIssue : issue))
        );
      }

      return updatedIssue ?? undefined;
    } catch (err) {
      setMutationError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    }
  };

  return { issues, loading, error, mutationError, updateIssue };
}
