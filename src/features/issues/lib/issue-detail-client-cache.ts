import type { ActivityLogEntry, Issue, Label } from "@/features/issues/types";

export interface ClientIssueDetailPayload {
  activityLog: ActivityLogEntry[];
  availableLabels: Label[];
  assigneeOptions: Array<{ label: string; value: string }>;
  issue: Issue;
  memberNamesById: Record<string, string>;
}

const payloadCache = new Map<string, ClientIssueDetailPayload>();
const inflightCache = new Map<string, Promise<ClientIssueDetailPayload>>();

function getCacheKey(projectId: string, issueId: string) {
  return `${projectId}:${issueId}`;
}

function isClientIssueDetailPayload(
  value: unknown
): value is ClientIssueDetailPayload {
  return Boolean(
    value &&
      typeof value === "object" &&
      "issue" in value &&
      "activityLog" in value &&
      "availableLabels" in value &&
      "assigneeOptions" in value &&
      "memberNamesById" in value
  );
}

export function getCachedIssueDetail(
  projectId: string,
  issueId: string
): ClientIssueDetailPayload | null {
  return payloadCache.get(getCacheKey(projectId, issueId)) ?? null;
}

export async function fetchIssueDetail(
  projectId: string,
  issueId: string
): Promise<ClientIssueDetailPayload> {
  const cacheKey = getCacheKey(projectId, issueId);
  const cached = payloadCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const inflight = inflightCache.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const request = fetch(`/api/issues/${issueId}?projectId=${projectId}`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to load issue");
      }

      const data = (await response.json()) as unknown;

      if (!isClientIssueDetailPayload(data)) {
        throw new Error("Invalid issue detail response");
      }

      payloadCache.set(cacheKey, data);
      return data;
    })
    .finally(() => {
      inflightCache.delete(cacheKey);
    });

  inflightCache.set(cacheKey, request);

  return request;
}

export function prefetchIssueDetail(projectId: string, issueId: string) {
  void fetchIssueDetail(projectId, issueId).catch(() => {
    // Ignore prefetch failures and retry when the drawer actually opens.
  });
}
