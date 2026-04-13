"use client";

import { useState } from "react";
import { timeAgoId } from "@/lib/timeAgo";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/Button";

interface CommentAuthor {
  name: string | null;
  avatarUrl: string | null;
}

interface CommentWithAuthor {
  id: string;
  content: string;
  author: CommentAuthor;
  createdAt: Date | string;
  parentId: string | null;
  isDeleted: boolean;
  replies: CommentWithAuthor[];
}

interface CommentTreeProps {
  comments: CommentWithAuthor[];
  threadId: string;
  isClosed: boolean;
  onReply: (parentId: string) => void;
}

function CommentItem({
  comment,
  threadId,
  isClosed,
  onReply,
  depth = 0,
}: {
  comment: CommentWithAuthor;
  threadId: string;
  isClosed: boolean;
  onReply: (parentId: string) => void;
  depth: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = depth >= 1;

  const handleReplyClick = () => {
    if (maxDepth) return;
    setShowReplyForm(true);
    onReply(comment.id);
  };

  const handleReplySubmit = async (content: string, _parentId?: string) => {
    await onReply(comment.id);
    setShowReplyForm(false);
  };

  const initial = comment.author?.name?.charAt(0).toUpperCase() || "?";

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {comment.author?.name || "Anonim"}
              </span>
              <span className="text-xs text-gray-400">{timeAgoId(comment.createdAt)}</span>
            </div>
            {comment.isDeleted ? (
              <p className="text-sm text-gray-400 italic">[Komentar telah dihapus]</p>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {comment.content}
              </div>
            )}
            {!comment.isDeleted && !maxDepth && !isClosed && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-7 text-xs px-2"
                onClick={handleReplyClick}
              >
                Balas
              </Button>
            )}
            {showReplyForm && !maxDepth && (
              <div className="mt-2">
                <CommentForm
                  onSubmit={handleReplySubmit}
                  placeholder={`Balas kepada ${comment.author?.name || "komentar ini"}...`}
                  parentId={comment.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              threadId={threadId}
              isClosed={isClosed}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentTree({ comments, threadId, isClosed, onReply }: CommentTreeProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">Belum ada komentar</p>
        <p className="text-sm">Jadilah yang pertama berkomentar</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          threadId={threadId}
          isClosed={isClosed}
          onReply={onReply}
          depth={0}
        />
      ))}
    </div>
  );
}
