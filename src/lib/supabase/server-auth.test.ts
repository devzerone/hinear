import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRequestSupabaseServerClientMock } = vi.hoisted(() => ({
  createRequestSupabaseServerClientMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server-client", () => ({
  createRequestSupabaseServerClient: createRequestSupabaseServerClientMock,
}));

import {
  AuthenticationRequiredError,
  getAuthenticatedActorIdOrNull,
  requireAuthenticatedActorId,
} from "@/lib/supabase/server-auth";

describe("server auth helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated user id when present", async () => {
    createRequestSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-17",
            },
          },
          error: null,
        }),
      },
    });

    await expect(getAuthenticatedActorIdOrNull()).resolves.toBe("user-17");
    await expect(requireAuthenticatedActorId()).resolves.toBe("user-17");
  });

  it("returns null and throws when the request has no authenticated user", async () => {
    createRequestSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
          error: null,
        }),
      },
    });

    await expect(getAuthenticatedActorIdOrNull()).resolves.toBeNull();
    await expect(requireAuthenticatedActorId()).rejects.toBeInstanceOf(
      AuthenticationRequiredError
    );
  });
});
