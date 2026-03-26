import { z } from "zod";

// List Labels Input Schema
export const listLabelsInputSchema = z.object({
  project_id: z.string().uuid("Invalid project ID format"),
});

// Create Label Input Schema
export const createLabelInputSchema = z.object({
  project_id: z.string().uuid("Invalid project ID format"),
  name: z
    .string()
    .min(1, "Label name is required")
    .max(50, "Label name must be 50 characters or less")
    .trim(),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Color must be a valid hex code (e.g., #FF0000)"
    ),
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .optional(),
});

// Update Label Input Schema
export const updateLabelInputSchema = z
  .object({
    label_id: z.string().uuid("Invalid label ID format"),
    name: z
      .string()
      .min(1, "Label name is required")
      .max(50, "Label name must be 50 characters or less")
      .trim()
      .optional(),
    color: z
      .string()
      .regex(
        /^#[0-9A-Fa-f]{6}$/,
        "Color must be a valid hex code (e.g., #FF0000)"
      )
      .optional(),
    description: z
      .string()
      .max(200, "Description must be 200 characters or less")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 1, // At least one field besides label_id
    {
      message:
        "At least one field (name, color, description) must be provided for update",
    }
  );

// Delete Label Input Schema
export const deleteLabelInputSchema = z.object({
  label_id: z.string().uuid("Invalid label ID format"),
});

// Label Output Schema
export const labelSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  description: z.string().nullable(),
  issue_count: z.number().int().nonnegative().optional(), // Optional: not always returned
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Types
export type ListLabelsInput = z.infer<typeof listLabelsInputSchema>;
export type CreateLabelInput = z.infer<typeof createLabelInputSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelInputSchema>;
export type DeleteLabelInput = z.infer<typeof deleteLabelInputSchema>;
export type Label = z.infer<typeof labelSchema>;
