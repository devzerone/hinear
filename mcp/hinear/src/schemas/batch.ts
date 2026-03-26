import { z } from "zod";

// Batch Update Issues Input Schema
export const batchUpdateIssuesInputSchema = z.object({
  issue_ids: z
    .array(z.string().uuid("Invalid issue ID format"))
    .min(1, "At least one issue ID is required")
    .max(100, "Cannot update more than 100 issues at once"),
  updates: z
    .object({
      status: z
        .enum(["Triage", "Backlog", "Todo", "In Progress", "Done"])
        .optional(),
      priority: z
        .enum(["No priority", "Low", "Medium", "High", "Critical"])
        .optional(),
      assignee_id: z.string().uuid("Invalid assignee ID format").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message:
        "At least one update field (status, priority, or assignee_id) must be provided",
    }),
  comment_on_change: z
    .string()
    .max(1000, "Comment must be 1000 characters or less")
    .optional(),
});

// Batch Operation Result Schema
export const batchOperationResultSchema = z.object({
  issue_id: z.string().uuid(),
  success: z.boolean(),
  error: z.string().nullable(),
});

// Batch Update Summary Schema
export const batchUpdateSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  succeeded: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});

// Batch Update Output Schema
export const batchUpdateOutputSchema = z.object({
  results: z.array(batchOperationResultSchema),
  summary: batchUpdateSummarySchema,
  duration_ms: z.number().int().nonnegative(),
});

// Types
export type BatchUpdateIssuesInput = z.infer<
  typeof batchUpdateIssuesInputSchema
>;
export type BatchOperationResult = z.infer<typeof batchOperationResultSchema>;
export type BatchUpdateSummary = z.infer<typeof batchUpdateSummarySchema>;
export type BatchUpdateOutput = z.infer<typeof batchUpdateOutputSchema>;
