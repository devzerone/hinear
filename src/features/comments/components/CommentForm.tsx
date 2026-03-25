import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  onSubmit: (body: string) => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
}

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "댓글을 입력하세요...",
  initialValue = "",
  submitLabel = "댓글 작성",
  isSubmitting = false,
  maxLength = 10000,
  autoFocus = false,
}: CommentFormProps) {
  const [body, setBody] = useState(initialValue);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (body.trim().length === 0) return;

    await onSubmit(body.trim());
    setBody("");
  };

  const characterCount = body.length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isAtLimit = characterCount >= maxLength;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="min-h-[100px] resize-y"
        disabled={isSubmitting}
      />
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span
            className={
              isAtLimit ? "text-red-500" : isNearLimit ? "text-yellow-600" : ""
            }
          >
            {characterCount}
          </span>
          <span className="text-gray-400"> / {maxLength.toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={body.trim().length === 0 || isSubmitting}
          >
            {isSubmitting ? "작성 중..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
