/**
 * Comment sanitization utilities
 * Prevent XSS and ensure safe HTML rendering
 */

/**
 * Strip HTML tags from comment body
 * For MVP, we store comments as plain text
 * Future: Use DOMPurify for rich text/Markdown support
 */
export function sanitizeCommentBody(body: string): string {
  // Remove HTML tags
  let sanitized = body.replace(/<[^>]*>/g, "");

  // Remove dangerous JavaScript patterns
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Check if comment contains only whitespace
 */
export function isWhitespaceOnly(body: string): boolean {
  return body.trim().length === 0;
}

/**
 * Normalize line endings to LF
 */
export function normalizeLineEndings(body: string): string {
  return body.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Truncate comment for preview
 */
export function truncateComment(body: string, maxLength: number = 200): string {
  if (body.length <= maxLength) {
    return body;
  }

  return `${body.slice(0, maxLength).trim()}...`;
}

/**
 * Extract mentions from comment body
 * Format: @username
 */
export function extractMentions(body: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions = new Set<string>();
  let match: RegExpExecArray | null = null;

  do {
    match = mentionRegex.exec(body);
    if (match) {
      mentions.add(match[1]);
    }
  } while (match !== null);

  return Array.from(mentions);
}

/**
 * Check if comment is edited (based on createdAt vs updatedAt)
 */
export function isEditedComment(
  createdAt: string,
  updatedAt?: string
): boolean {
  if (!updatedAt) {
    return false;
  }

  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();

  // Consider edited if updated more than 1 minute after creation
  return updated - created > 60 * 1000;
}
