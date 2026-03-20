import "server-only";

import { headers } from "next/headers";

function readForwardedHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() ?? null;
}

export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const protocol =
    readForwardedHeaderValue(requestHeaders.get("x-forwarded-proto")) ?? "http";
  const host =
    readForwardedHeaderValue(requestHeaders.get("x-forwarded-host")) ??
    readForwardedHeaderValue(requestHeaders.get("host")) ??
    "localhost:3000";

  return `${protocol}://${host}`;
}
