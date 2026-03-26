/**
 * Label Adapter Unit Tests
 *
 * TDD Approach: Red-Green-Refactor
 * 1. Red: Write failing tests
 * 2. Green: Implement minimal code to pass tests
 * 3. Refactor: Improve code quality
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLabel,
  deleteLabel,
  listLabels,
  updateLabel,
} from "../labels.js";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

// Mock auth module
vi.mock("../../lib/auth.js", () => ({
  resolveSession: vi.fn(() => ({
    userId: "mock-user-id",
    accessToken: null,
  })),
}));

vi.mock("../../lib/supabase.js", () => ({
  createMcpActorSupabaseClient: vi.fn(() => mockSupabase),
}));

describe("Label Adapter", () => {
  const mockProjectId = "550e8400-e29b-41d4-a716-446655440000";
  const mockLabelId = "550e8400-e29b-41d4-a716-446655440001";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listLabels", () => {
    it("should list all labels for a project", async () => {
      const mockLabels = [
        {
          id: mockLabelId,
          project_id: mockProjectId,
          name: "Bug",
          color: "#FF0000",
          description: "Bug reports",
          created_at: "2026-03-26T10:00:00Z",
          updated_at: "2026-03-26T10:00:00Z",
        },
      ];

      const selectMock = vi.fn().mockResolvedValue({
        data: mockLabels,
        error: null,
      });
      const orderMock = vi.fn().mockReturnValue({ select: selectMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: orderMock as any,
      } as any);

      const result = await listLabels({ project_id: mockProjectId });

      expect(result.labels).toHaveLength(1);
      expect(result.labels[0].name).toBe("Bug");
      expect(result.total).toBe(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("labels");
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

      await expect(listLabels({ project_id: mockProjectId })).rejects.toThrow(
        "Failed to list labels"
      );
    });
  });

  describe("createLabel", () => {
    it("should create a new label", async () => {
      const newLabel = {
        id: mockLabelId,
        project_id: mockProjectId,
        name: "Feature",
        color: "#00FF00",
        description: "New feature",
        created_at: "2026-03-26T10:00:00Z",
        updated_at: "2026-03-26T10:00:00Z",
      };

      const insertMock = vi.fn().mockResolvedValue({
        data: newLabel,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ insert: insertMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: selectMock as any,
      } as any);

      const result = await createLabel({
        project_id: mockProjectId,
        name: "Feature",
        color: "#00FF00",
        description: "New feature",
      });

      expect(result.label.name).toBe("Feature");
      expect(result.label.color).toBe("#00FF00");
      expect(mockSupabase.from).toHaveBeenCalledWith("labels");
    });

    it("should throw error if label already exists", async () => {
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
        createLabel({
          project_id: mockProjectId,
          name: "Bug",
          color: "#FF0000",
        })
      ).rejects.toThrow("LABEL_ALREADY_EXISTS");
    });
  });

  describe("updateLabel", () => {
    it("should update an existing label", async () => {
      const updatedLabel = {
        id: mockLabelId,
        project_id: mockProjectId,
        name: "Bug",
        color: "#0000FF",
        description: "Updated description",
        created_at: "2026-03-26T10:00:00Z",
        updated_at: "2026-03-26T10:05:00Z",
      };

      const updateMock = vi.fn().mockResolvedValue({
        data: updatedLabel,
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ update: updateMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      const result = await updateLabel({
        label_id: mockLabelId,
        color: "#0000FF",
        description: "Updated description",
      });

      expect(result.label.color).toBe("#0000FF");
      expect(result.label.description).toBe("Updated description");
    });

    it("should throw error if label not found", async () => {
      const updateMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Label not found" },
      });
      const eqMock = vi.fn().mockReturnValue({ update: updateMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      await expect(
        updateLabel({
          label_id: "nonexistent-id",
          color: "#0000FF",
        })
      ).rejects.toThrow("LABEL_NOT_FOUND");
    });
  });

  describe("deleteLabel", () => {
    it("should delete a label", async () => {
      const deleteMock = vi.fn().mockResolvedValue({
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ delete: deleteMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      const result = await deleteLabel({ label_id: mockLabelId });

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("labels");
    });

    it("should throw error if label not found", async () => {
      const deleteMock = vi.fn().mockResolvedValue({
        error: { message: "Label not found" },
      });
      const eqMock = vi.fn().mockReturnValue({ delete: deleteMock });

      vi.mocked(mockSupabase.from).mockReturnValue({
        eq: eqMock as any,
      } as any);

      await expect(deleteLabel({ label_id: "nonexistent-id" })).rejects.toThrow(
        "LABEL_NOT_FOUND"
      );
    });
  });
});
