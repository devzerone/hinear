/**
 * Member Schema Validation Tests
 *
 * TDD Approach: Red-Green-Refactor
 * Tests for Zod schema validation
 */

import { describe, expect, it } from "vitest";
import {
  invitationSchema,
  inviteMemberInputSchema,
  listMembersInputSchema,
  memberSchema,
  removeMemberInputSchema,
  updateMemberRoleInputSchema,
} from "../member.js";

describe("Member Schemas", () => {
  const validProjectId = "550e8400-e29b-41d4-a716-446655440000";
  const validMemberId = "550e8400-e29b-41d4-a716-446655440001";
  const validUserId = "550e8400-e29b-41d4-a716-446655440002";

  describe("listMembersInputSchema", () => {
    it("should validate valid input", () => {
      const result = listMembersInputSchema.safeParse({
        project_id: validProjectId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid project_id format", () => {
      const result = listMembersInputSchema.safeParse({
        project_id: "not-a-uuid",
      });

      expect(result.success).toBe(false);
    });

    it("should require project_id", () => {
      const result = listMembersInputSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe("inviteMemberInputSchema", () => {
    const validInput = {
      project_id: validProjectId,
      email: "newuser@example.com",
      role: "member" as const,
    };

    it("should validate valid input with member role", () => {
      const result = inviteMemberInputSchema.safeParse(validInput);

      expect(result.success).toBe(true);
    });

    it("should validate valid input with owner role", () => {
      const result = inviteMemberInputSchema.safeParse({
        ...validInput,
        role: "owner" as const,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalidEmails = [
        "not-an-email",
        "missing@tld",
        "@example.com",
        "user@",
      ];

      invalidEmails.forEach((email) => {
        const result = inviteMemberInputSchema.safeParse({
          ...validInput,
          email,
        });

        expect(result.success).toBe(false);
      });
    });

    it("should accept valid email formats", () => {
      const validEmails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.com",
        "user@subdomain.example.com",
      ];

      validEmails.forEach((email) => {
        const result = inviteMemberInputSchema.safeParse({
          ...validInput,
          email,
        });

        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid role values", () => {
      const result = inviteMemberInputSchema.safeParse({
        ...validInput,
        role: "admin",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("owner");
      }
    });

    it("should require all fields", () => {
      const requiredFields = ["project_id", "email", "role"];

      requiredFields.forEach((field) => {
        const invalidInput = { ...validInput };
        delete (invalidInput as any)[field];

        const result = inviteMemberInputSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateMemberRoleInputSchema", () => {
    it("should validate valid input with owner role", () => {
      const result = updateMemberRoleInputSchema.safeParse({
        member_id: validMemberId,
        role: "owner",
      });

      expect(result.success).toBe(true);
    });

    it("should validate valid input with member role", () => {
      const result = updateMemberRoleInputSchema.safeParse({
        member_id: validMemberId,
        role: "member",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid member_id format", () => {
      const result = updateMemberRoleInputSchema.safeParse({
        member_id: "not-a-uuid",
        role: "owner",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const result = updateMemberRoleInputSchema.safeParse({
        member_id: validMemberId,
        role: "admin",
      });

      expect(result.success).toBe(false);
    });

    it("should require all fields", () => {
      const result = updateMemberRoleInputSchema.safeParse({
        member_id: validMemberId,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("removeMemberInputSchema", () => {
    it("should validate valid input", () => {
      const result = removeMemberInputSchema.safeParse({
        member_id: validMemberId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid member_id format", () => {
      const result = removeMemberInputSchema.safeParse({
        member_id: "not-a-uuid",
      });

      expect(result.success).toBe(false);
    });

    it("should require member_id", () => {
      const result = removeMemberInputSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe("memberSchema (output)", () => {
    const validMember = {
      id: validMemberId,
      role: "owner" as const,
      profile: {
        id: validUserId,
        display_name: "John Doe",
        email: "john@example.com",
      },
      created_at: "2026-03-26T10:00:00Z",
    };

    it("should validate valid member output", () => {
      const result = memberSchema.safeParse(validMember);

      expect(result.success).toBe(true);
    });

    it("should accept nullable display_name", () => {
      const result = memberSchema.safeParse({
        ...validMember,
        profile: {
          ...validMember.profile,
          display_name: null,
        },
      });

      expect(result.success).toBe(true);
    });

    it("should accept nullable email", () => {
      const result = memberSchema.safeParse({
        ...validMember,
        profile: {
          ...validMember.profile,
          email: null,
        },
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid role", () => {
      const result = memberSchema.safeParse({
        ...validMember,
        role: "admin",
      });

      expect(result.success).toBe(false);
    });

    it("should require all fields", () => {
      const requiredFields = ["id", "role", "profile", "created_at"];

      requiredFields.forEach((field) => {
        const invalidMember = { ...validMember };
        delete (invalidMember as any)[field];

        const result = memberSchema.safeParse(invalidMember);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("invitationSchema (output)", () => {
    const validInvitation = {
      id: validMemberId,
      email: "invited@example.com",
      role: "member" as const,
      status: "pending" as const,
      expires_at: "2026-04-02T10:00:00Z",
      created_at: "2026-03-26T10:00:00Z",
    };

    it("should validate valid invitation output", () => {
      const result = invitationSchema.safeParse(validInvitation);

      expect(result.success).toBe(true);
    });

    it("should only accept pending status", () => {
      const result = invitationSchema.safeParse({
        ...validInvitation,
        status: "accepted",
      });

      expect(result.success).toBe(false);
    });

    it("should require valid email format", () => {
      const result = invitationSchema.safeParse({
        ...validInvitation,
        email: "not-an-email",
      });

      expect(result.success).toBe(false);
    });

    it("should require all fields", () => {
      const requiredFields = [
        "id",
        "email",
        "role",
        "status",
        "expires_at",
        "created_at",
      ];

      requiredFields.forEach((field) => {
        const invalidInvitation = { ...validInvitation };
        delete (invalidInvitation as any)[field];

        const result = invitationSchema.safeParse(invalidInvitation);
        expect(result.success).toBe(false);
      });
    });
  });
});
