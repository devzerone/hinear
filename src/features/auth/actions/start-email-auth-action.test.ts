import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRequestOriginMock, redirectMock, signInWithOtpMock } = vi.hoisted(
  () => ({
    getRequestOriginMock: vi.fn(),
    redirectMock: vi.fn(),
    signInWithOtpMock: vi.fn(),
  })
);

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/request-origin", () => ({
  getRequestOrigin: getRequestOriginMock,
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createServerSupabaseClient: () => ({
    auth: {
      signInWithOtp: signInWithOtpMock,
    },
  }),
}));

import { startEmailAuthAction } from "@/features/auth/actions/start-email-auth-action";

describe("startEmailAuthAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts magic link auth and redirects to sent state", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("next", "/projects/new");
    formData.set("reason", "auth_required");

    getRequestOriginMock.mockResolvedValue("https://hinear.test");
    signInWithOtpMock.mockResolvedValue({ error: null });

    await startEmailAuthAction(formData);

    expect(signInWithOtpMock).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        emailRedirectTo:
          "https://hinear.test/auth/confirm?next=%2Fprojects%2Fnew",
        shouldCreateUser: true,
      },
    });
    expect(redirectMock).toHaveBeenCalledWith(
      "/auth?next=%2Fprojects%2Fnew&reason=auth_required&email=test%40example.com&sent=1"
    );
  });

  it("redirects back with an auth error message", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("next", "/projects/proj-1");
    formData.set("reason", "session_expired");

    getRequestOriginMock.mockResolvedValue("https://hinear.test");
    signInWithOtpMock.mockResolvedValue({
      error: { message: "Invalid login." },
    });

    await startEmailAuthAction(formData);

    expect(redirectMock).toHaveBeenCalledWith(
      "/auth?next=%2Fprojects%2Fproj-1&reason=session_expired&email=test%40example.com&error=Invalid+login."
    );
  });
});
