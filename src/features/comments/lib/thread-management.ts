/**
 * Thread management utilities
 * Handle nested replies and thread structure
 */

import type { Comment, CommentWithAuthor } from "../types";

/**
 * Build a hierarchical tree of comments from a flat list
 */
export function buildCommentTree(
  comments: CommentWithAuthor[]
  // rootCommentId?: string
): CommentWithAuthor[] {
  const commentMap = new Map<string, CommentWithAuthor>();
  const rootComments: CommentWithAuthor[] = [];

  // First pass: create map and identify root comments
  for (const comment of comments) {
    commentMap.set(comment.id, { ...comment, replies: [] });
  }

  // Second pass: build tree structure
  for (const comment of comments) {
    const enriched = commentMap.get(comment.id);
    if (!enriched) continue;

    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        if (!parent.replies) {
          parent.replies = [];
        }
        parent.replies.push(enriched);
      }
    } else {
      rootComments.push(enriched);
    }
  }

  return rootComments;
}

/**
 * Flatten a comment tree back to a list with depth information
 */
export interface FlatComment extends CommentWithAuthor {
  depth: number;
}

export function flattenCommentTree(
  comments: CommentWithAuthor[],
  depth: number = 0
): FlatComment[] {
  const result: FlatComment[] = [];

  for (const comment of comments) {
    result.push({ ...comment, depth });
    if (comment.replies && comment.replies.length > 0) {
      result.push(...flattenCommentTree(comment.replies, depth + 1));
    }
  }

  return result;
}

/**
 * Get thread statistics
 */
export interface ThreadStats {
  totalComments: number;
  rootComments: number;
  replyCount: number;
  maxDepth: number;
  participants: Set<string>;
}

export function getThreadStats(
  comments: Comment[]
): Omit<ThreadStats, "participants"> & { participants: string[] } {
  const rootComments = comments.filter((c) => !c.parentCommentId);
  const replyCount = comments.length - rootComments.length;

  // Calculate max depth
  let maxDepth = 0;
  const depths = new Map<string, number>();

  for (const comment of comments) {
    if (!comment.parentCommentId) {
      depths.set(comment.id, 0);
    } else {
      const parentDepth = depths.get(comment.parentCommentId) ?? 0;
      depths.set(comment.id, parentDepth + 1);
      maxDepth = Math.max(maxDepth, parentDepth + 1);
    }
  }

  // Get unique participants
  const participants = new Set(comments.map((c) => c.authorId));

  return {
    totalComments: comments.length,
    rootComments: rootComments.length,
    replyCount,
    maxDepth,
    participants: Array.from(participants),
  };
}

/**
 * Check if a comment is a root comment (has no parent)
 */
export function isRootComment(comment: Comment): boolean {
  return !comment.parentCommentId;
}

/**
 * Get all descendant IDs of a comment (for deletion cascading)
 */
export function getDescendantIds(
  commentId: string,
  allComments: Comment[]
): string[] {
  const descendants: string[] = [];
  const queue = [commentId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    const children = allComments.filter((c) => c.parentCommentId === current);

    for (const child of children) {
      descendants.push(child.id);
      queue.push(child.id);
    }
  }

  return descendants;
}

/**
 * Sort comments for display
 */
export type CommentSortOrder = "oldest" | "newest" | "most_replies";

export function sortComments(
  comments: Comment[],
  order: CommentSortOrder = "newest"
): Comment[] {
  const sorted = [...comments];

  switch (order) {
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "most_replies":
      // For this, we'd need to count replies - placeholder for now
      return sorted;
    default:
      return sorted;
  }
}
