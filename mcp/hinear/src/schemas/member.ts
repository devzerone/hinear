import { z } from "zod";

// List Members Input Schema
export const listMembersInputSchema = z.object({
  project_id: z.string().uuid("Invalid project ID format"),
});

// Invite Member Input Schema
export const inviteMemberInputSchema = z.object({
  project_id: z.string().uuid("Invalid project ID format"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["owner", "member"], {
    message: 'Role must be either "owner" or "member"',
  }),
});

// Update Member Role Input Schema
export const updateMemberRoleInputSchema = z.object({
  member_id: z.string().uuid("Invalid member ID format"),
  role: z.enum(["owner", "member"], {
    message: 'Role must be either "owner" or "member"',
  }),
});

// Remove Member Input Schema
export const removeMemberInputSchema = z.object({
  member_id: z.string().uuid("Invalid member ID format"),
});

// Member Profile Schema
export const memberProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().nullable(),
  email: z.string().email().nullable(),
});

// Member Schema
export const memberSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["owner", "member"]),
  profile: memberProfileSchema,
  created_at: z.string().datetime(),
});

// Invitation Schema
export const invitationSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["owner", "member"]),
  status: z.literal("pending"),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

// Types
export type ListMembersInput = z.infer<typeof listMembersInputSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleInputSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberInputSchema>;
export type MemberProfile = z.infer<typeof memberProfileSchema>;
export type Member = z.infer<typeof memberSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
