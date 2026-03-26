const EMBEDDED_CONTENT_TAG_PATTERN =
  /<(img|video|iframe|embed|object|svg|canvas)\b/i;

export function hasMeaningfulRichTextContent(value: string): boolean {
  if (value.trim().length === 0) {
    return false;
  }

  if (EMBEDDED_CONTENT_TAG_PATTERN.test(value)) {
    return true;
  }

  const textOnly = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();

  return textOnly.length > 0;
}
