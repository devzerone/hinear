import { z } from "zod";

export const issueStatusSchema = z.enum([
  "triage",
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
]);

export const issuePrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const paginationLimitSchema = z
  .number()
  .int()
  .min(1)
  .max(100)
  .optional();
