export function buildIssueDrawerUrl(
  pathname: string,
  search: string | URLSearchParams,
  issueId: string | null
): string {
  const nextParams =
    typeof search === "string"
      ? new URLSearchParams(search)
      : new URLSearchParams(search.toString());

  if (issueId) {
    nextParams.set("issueId", issueId);
  } else {
    nextParams.delete("issueId");
  }

  const nextQuery = nextParams.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

export function updateIssueDrawerUrl(
  pathname: string,
  search: string | URLSearchParams,
  issueId: string | null,
  mode: "push" | "replace" = "push"
) {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = buildIssueDrawerUrl(pathname, search, issueId);
  const updater =
    mode === "replace" ? window.history.replaceState : window.history.pushState;

  updater.call(window.history, null, "", nextUrl);
}
