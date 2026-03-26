import { z } from "zod";

export const addCommentInputSchema = {
  issue_id: z.string().min(1),
  body: z.string().min(1),
  parent_comment_id: z.string().optional(),
};

export type AddCommentInput = z.infer<
  z.ZodObject<typeof addCommentInputSchema>
>;
