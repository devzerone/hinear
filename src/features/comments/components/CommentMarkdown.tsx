interface CommentMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown renderer for comments
 * For MVP, renders as plain text with line breaks
 */
export function CommentMarkdown({
  content,
  className = "",
}: CommentMarkdownProps) {
  const lines = content.split("\n");

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {lines.map((line, i) => (
        <span key={line}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
