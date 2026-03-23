import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

import { getRequestOrigin } from "@/lib/request-origin";

function createHeaders(values: Record<string, string | null>) {
  return {
    get(name: string) {
      return values[name] ?? null;
    },
  };
}

describe("getRequestOrigin", () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.APP_ORIGIN;
    delete process.env.NEXT_PUBLIC_APP_ORIGIN;
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    vi.clearAllMocks();
  });

  it("forces localhost in development", async () => {
    process.env.NODE_ENV = "development";
    process.env.APP_ORIGIN = "https://app.hinear.com";
    headersMock.mockResolvedValue(createHeaders({}));

    await expect(getRequestOrigin()).resolves.toBe("http://localhost:3000");
  });

  it("prefers configured app origin", async () => {
    process.env.APP_ORIGIN = "https://app.hinear.com";
    headersMock.mockResolvedValue(createHeaders({}));

    await expect(getRequestOrigin()).resolves.toBe("https://app.hinear.com");
  });

  it("normalizes deployment host envs without protocol", async () => {
    process.env.VERCEL_URL = "hinear.vercel.app";
    headersMock.mockResolvedValue(createHeaders({}));

    await expect(getRequestOrigin()).resolves.toBe("https://hinear.vercel.app");
  });

  it("falls back to forwarded headers when config is missing", async () => {
    headersMock.mockResolvedValue(
      createHeaders({
        "x-forwarded-host": "prod.hinear.app",
        "x-forwarded-proto": "https",
      })
    );

    await expect(getRequestOrigin()).resolves.toBe("https://prod.hinear.app");
  });
});
