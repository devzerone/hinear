import { describe, expect, it } from "vitest";

import {
  buildAuthPath,
  normalizeNextPath,
} from "@/features/auth/lib/next-path";

describe("normalizeNextPath", () => {
  it("keeps safe internal paths", () => {
    expect(normalizeNextPath("/projects/test#new-issue-form")).toBe(
      "/projects/test#new-issue-form"
    );
  });

  it("falls back for external targets", () => {
    expect(normalizeNextPath("https://example.com", "/auth")).toBe("/auth");
    expect(normalizeNextPath("//evil.test", "/auth")).toBe("/auth");
    expect(normalizeNextPath("projects/test", "/auth")).toBe("/auth");
  });
});

describe("buildAuthPath", () => {
  it("encodes the next path", () => {
    expect(buildAuthPath("/projects/test#new-issue-form")).toBe(
      "/auth?next=%2Fprojects%2Ftest%23new-issue-form&reason=auth_required"
    );
  });

  it("supports session-expired redirects", () => {
    expect(buildAuthPath("/projects/test", "session_expired")).toBe(
      "/auth?next=%2Fprojects%2Ftest&reason=session_expired"
    );
  });
});
