export type AuthRedirectReason = "auth_required" | "session_expired";

export function normalizeNextPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/"
): string {
  const raw = typeof value === "string" ? value.trim() : "";

  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }

  return raw;
}

export function buildAuthPath(
  nextPath: string,
  reason: AuthRedirectReason = "auth_required"
): string {
  return `/auth?next=${encodeURIComponent(normalizeNextPath(nextPath))}&reason=${reason}`;
}
