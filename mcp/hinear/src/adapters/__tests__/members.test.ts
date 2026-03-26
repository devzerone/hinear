/**
 * Member Adapter Unit Tests
 *
 * TDD Approach: Red-Green-Refactor
 * 1. Red: Write failing tests
 * 2. Green: Implement minimal code to pass tests
 * 3. Refactor: Improve code quality
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  inviteMember,
  listMembers,
  removeMember,
  updateMemberRole,
} from "../members.js";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

// Mock dependencies
vi.mock("../../lib/auth.js", () => ({
  resolveSession: vi.fn(() => ({
    userId: "mock-user-id",
    accessToken: null,
  })),
}));

vi.mock("../../lib/supabase.js", () => ({
  createMcpActorSupabaseClient: vi.fn(() => mockSupabase),
}));

describe("Member Adapter", () => {
  const mockProjectId = "550e8400-e29b-41d4-a716-446655440000";
  const mockMemberId = "550e8400-e29b-41d4-a716-446655440001";
  const mockInvitationId = "550e8400-e29b-41d4-a716-446655440002";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listMembers", () => {
    it("should list all members for a project", async () => {
      const mockMembers = [
        {
          id: mockMemberId,
          role: "owner",
          profile: {
            id: "user-1",
            display_name: "John Doe",
            email: "john@example.com",
          },
          created_at: "2026-03-26T10:00:00Z",
        },
      ];

      const selectMock = vi.fn().mockResolvedValue({
        data: mockMembers,
        error: null,
      });
      const orderMock = vi.fn().mockReturnValue({ select: selectMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: orderMock as any,
      } as any);

      const result = await listMembers({ project_id: mockProjectId });

      expect(result.members).toHaveLength(1);
      expect(result.members[0].role).toBe("owner");
      expect(result.total).toBe(1);
    });

    it("should throw error if database query fails", async () => {
      const selectMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });
      const orderMock = vi.fn().mockReturnValue({ select: selectMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: orderMock as any,
      } as any);

      await expect(listMembers({ project_id: mockProjectId })).rejects.toThrow(
        "Failed to list members"
      );
    });
  });

  describe("inviteMember", () => {
    it("should create a new invitation", async () => {
      const mockInvitation = {
        id: mockInvitationId,
        email: "newuser@example.com",
        role: "member",
        status: "pending",
        expires_at: "2026-04-02T10:00:00Z",
        created_at: "2026-03-26T10:00:00Z",
      };

      const insertMock = vi.fn().mockResolvedValue({
        data: mockInvitation,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ insert: insertMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: selectMock as any,
      } as any);

      const result = await inviteMember({
        project_id: mockProjectId,
        email: "newuser@example.com",
        role: "member",
      });

      expect(result.invitation.email).toBe("newuser@example.com");
      expect(result.invitation.role).toBe("member");
      expect(result.invite_url).toContain("/invitations/");
    });

    it("should throw error if email already invited", async () => {
      const insertMock = vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: "duplicate key value violates unique constraint",
          code: "23505",
        },
      });
      const selectMock = vi.fn().mockReturnValue({ insert: insertMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: selectMock as any,
      } as any);

      await expect(
        inviteMember({
          project_id: mockProjectId,
          email: "existing@example.com",
          role: "member",
        })
      ).rejects.toThrow("INVITATION_EXISTS");
    });

    it("should throw error if user is already a member", async () => {
      const insertMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "User is already a member" },
      });
      const selectMock = vi.fn().mockReturnValue({ insert: insertMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: selectMock as any,
      } as any);

      await expect(
        inviteMember({
          project_id: mockProjectId,
          email: "member@example.com",
          role: "member",
        })
      ).rejects.toThrow("ALREADY_MEMBER");
    });
  });

  describe("updateMemberRole", () => {
    it("should update member role", async () => {
      const updatedMember = {
        id: mockMemberId,
        role: "owner",
        profile: {
          id: "user-1",
          display_name: "Jane Smith",
          email: "jane@example.com",
        },
        created_at: "2026-03-26T10:00:00Z",
        updated_at: "2026-03-26T10:05:00Z",
      };

      const updateMock = vi.fn().mockResolvedValue({
        data: updatedMember,
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ update: updateMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      const result = await updateMemberRole({
        member_id: mockMemberId,
        role: "owner",
      });

      expect(result.member.role).toBe("owner");
    });

    it("should throw error if member not found", async () => {
      const updateMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Member not found" },
      });
      const eqMock = vi.fn().mockReturnValue({ update: updateMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      await expect(
        updateMemberRole({
          member_id: "nonexistent-id",
          role: "owner",
        })
      ).rejects.toThrow("MEMBER_NOT_FOUND");
    });

    it("should throw error if role is the same", async () => {
      const updateMock = vi.fn().mockResolvedValue({
        data: { role: "member" },
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ update: updateMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      await expect(
        updateMemberRole({
          member_id: mockMemberId,
          role: "member",
        })
      ).rejects.toThrow("SAME_ROLE");
    });
  });

  describe("removeMember", () => {
    it("should remove a member", async () => {
      const deleteMock = vi.fn().mockResolvedValue({
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ delete: deleteMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      const result = await removeMember({ member_id: mockMemberId });

      expect(result.success).toBe(true);
      expect(result.type).toBe("member");
    });

    it("should revoke a pending invitation", async () => {
      const updateMock = vi.fn().mockResolvedValue({
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ update: updateMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
        update: updateMock as any,
      } as any);

      const result = await removeMember({ member_id: mockInvitationId });

      expect(result.success).toBe(true);
      expect(result.type).toBe("invitation");
    });

    it("should throw error if member/invitation not found", async () => {
      const deleteMock = vi.fn().mockResolvedValue({
        error: { message: "Not found" },
      });
      const eqMock = vi.fn().mockReturnValue({ delete: deleteMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      await expect(
        removeMember({ member_id: "nonexistent-id" })
      ).rejects.toThrow("MEMBER_NOT_FOUND");
    });
  });
});
