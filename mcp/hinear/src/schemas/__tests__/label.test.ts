/**
 * Label Schema Validation Tests
 *
 * TDD Approach: Red-Green-Refactor
 * Tests for Zod schema validation
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  createLabelInputSchema,
  deleteLabelInputSchema,
  labelSchema,
  listLabelsInputSchema,
  updateLabelInputSchema,
} from "../label.js";

describe("Label Schemas", () => {
  const validProjectId = "550e8400-e29b-41d4-a716-446655440000";
  const validLabelId = "550e8400-e29b-41d4-a716-446655440001";

  describe("listLabelsInputSchema", () => {
    it("should validate valid input", () => {
      const result = listLabelsInputSchema.safeParse({
        project_id: validProjectId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid project_id format", () => {
      const result = listLabelsInputSchema.safeParse({
        project_id: "not-a-uuid",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid project ID");
      }
    });

    it("should require project_id", () => {
      const result = listLabelsInputSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe("createLabelInputSchema", () => {
    const validInput = {
      project_id: validProjectId,
      name: "Bug",
      color: "#FF0000",
      description: "Bug reports",
    };

    it("should validate valid input", () => {
      const result = createLabelInputSchema.safeParse(validInput);

      expect(result.success).toBe(true);
    });

    it("should accept input without optional description", () => {
      const result = createLabelInputSchema.safeParse({
        project_id: validProjectId,
        name: "Feature",
        color: "#00FF00",
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = createLabelInputSchema.safeParse({
        ...validInput,
        name: "",
      });

      expect(result.success).toBe(false);
    });

    it("should reject name over 50 characters", () => {
      const result = createLabelInputSchema.safeParse({
        ...validInput,
        name: "A".repeat(51),
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid color format", () => {
      const invalidColors = [
        "FF0000", // Missing #
        "red", // Not hex
        "#GG0000", // Invalid hex
        "#FFF", // Too short
        "#FFFFFFF", // Too long
      ];

      invalidColors.forEach((color) => {
        const result = createLabelInputSchema.safeParse({
          ...validInput,
          color,
        });

        expect(result.success).toBe(false);
      });
    });

    it("should accept valid hex color codes", () => {
      const validColors = [
        "#FF0000", // Red
        "#00FF00", // Green
        "#0000FF", // Blue
        "#000000", // Black
        "#FFFFFF", // White
        "#ff0000", // Lowercase
        "#AbCdEf", // Mixed case
      ];

      validColors.forEach((color) => {
        const result = createLabelInputSchema.safeParse({
          ...validInput,
          color,
        });

        expect(result.success).toBe(true);
      });
    });

    it("should trim whitespace from name", () => {
      const result = createLabelInputSchema.safeParse({
        ...validInput,
        name: "  Bug  ",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Bug");
      }
    });

    it("should reject description over 200 characters", () => {
      const result = createLabelInputSchema.safeParse({
        ...validInput,
        description: "A".repeat(201),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateLabelInputSchema", () => {
    it("should require at least one field to update", () => {
      const result = updateLabelInputSchema.safeParse({
        label_id: validLabelId,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("At least one field");
      }
    });

    it("should accept updating only name", () => {
      const result = updateLabelInputSchema.safeParse({
        label_id: validLabelId,
        name: "Updated Name",
      });

      expect(result.success).toBe(true);
    });

    it("should accept updating only color", () => {
      const result = updateLabelInputSchema.safeParse({
        label_id: validLabelId,
        color: "#00FF00",
      });

      expect(result.success).toBe(true);
    });

    it("should accept updating only description", () => {
      const result = updateLabelInputSchema.safeParse({
        label_id: validLabelId,
        description: "Updated description",
      });

      expect(result.success).toBe(true);
    });

    it("should accept updating multiple fields", () => {
      const result = updateLabelInputSchema.safeParse({
        label_id: validLabelId,
        name: "Updated",
        color: "#00FF00",
        description: "Updated description",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid label_id", () => {
      const result = updateLabelInputSchema.safeParse({
        label_id: "not-a-uuid",
        name: "Updated",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("deleteLabelInputSchema", () => {
    it("should validate valid input", () => {
      const result = deleteLabelInputSchema.safeParse({
        label_id: validLabelId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid label_id", () => {
      const result = deleteLabelInputSchema.safeParse({
        label_id: "not-a-uuid",
      });

      expect(result.success).toBe(false);
    });

    it("should require label_id", () => {
      const result = deleteLabelInputSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe("labelSchema (output)", () => {
    const validLabel = {
      id: validLabelId,
      project_id: validProjectId,
      name: "Bug",
      color: "#FF0000",
      description: "Bug reports",
      created_at: "2026-03-26T10:00:00Z",
      updated_at: "2026-03-26T10:00:00Z",
    };

    it("should validate valid label output", () => {
      const result = labelSchema.safeParse(validLabel);

      expect(result.success).toBe(true);
    });

    it("should accept nullable description", () => {
      const result = labelSchema.safeParse({
        ...validLabel,
        description: null,
      });

      expect(result.success).toBe(true);
    });

    it("should accept optional issue_count", () => {
      const result = labelSchema.safeParse({
        ...validLabel,
        issue_count: 5,
      });

      expect(result.success).toBe(true);
    });

    it("should reject negative issue_count", () => {
      const result = labelSchema.safeParse({
        ...validLabel,
        issue_count: -1,
      });

      expect(result.success).toBe(false);
    });

    it("should require all required fields", () => {
      const requiredFields = [
        "id",
        "project_id",
        "name",
        "color",
        "created_at",
        "updated_at",
      ];

      requiredFields.forEach((field) => {
        const invalidLabel = { ...validLabel };
        delete (invalidLabel as any)[field];

        const result = labelSchema.safeParse(invalidLabel);
        expect(result.success).toBe(false);
      });
    });
  });
});
