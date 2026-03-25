import type { CommentWithAuthor } from "@/features/comments/types";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: CommentWithAuthor[];
  currentUserId?: string;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string, body: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

export function CommentList({
  comments,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  className = "",
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
