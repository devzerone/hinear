import "server-only";

import { headers } from "next/headers";

function readForwardedHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() ?? null;
}

function normalizeOrigin(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

function readConfiguredOrigin(): string | null {
  return normalizeOrigin(
    process.env.APP_ORIGIN ??
      process.env.NEXT_PUBLIC_APP_ORIGIN ??
      process.env.SITE_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.VERCEL_PROJECT_PRODUCTION_URL ??
      process.env.VERCEL_URL
  );
}

export async function getRequestOrigin(): Promise<string> {
  const configuredOrigin = readConfiguredOrigin();

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const requestHeaders = await headers();
  const originHeader = normalizeOrigin(requestHeaders.get("origin"));

  if (originHeader) {
    return originHeader;
  }

  const protocol =
    readForwardedHeaderValue(requestHeaders.get("x-forwarded-proto")) ?? "http";
  const host =
    readForwardedHeaderValue(requestHeaders.get("x-forwarded-host")) ??
    readForwardedHeaderValue(requestHeaders.get("host")) ??
    "localhost:3000";

  return normalizeOrigin(`${protocol}://${host}`) ?? "http://localhost:3000";
}
