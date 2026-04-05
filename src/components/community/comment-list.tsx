"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  body: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
}

export function CommentList({
  comments,
  discussionId,
  contentId,
  userId,
  isAdmin,
}: {
  comments: Comment[];
  discussionId?: string;
  contentId?: string;
  userId: string;
  isAdmin: boolean;
}) {
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="space-y-4">
      {topLevel.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={replies(comment.id)}
          allComments={comments}
          discussionId={discussionId}
          contentId={contentId}
          userId={userId}
          isAdmin={isAdmin}
          depth={0}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  allComments,
  discussionId,
  contentId,
  userId,
  isAdmin,
  depth,
}: {
  comment: Comment;
  replies: Comment[];
  allComments: Comment[];
  discussionId?: string;
  contentId?: string;
  userId: string;
  isAdmin: boolean;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const canDelete = comment.user_id === userId || isAdmin;
  const displayName = comment.profiles?.full_name || comment.profiles?.email || "Member";

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    await supabase.from("comments").delete().eq("id", comment.id);
    router.refresh();
  }

  return (
    <div className={depth > 0 ? "ml-6 border-l border-stone/15 pl-4" : ""}>
      <div className="rounded-lg bg-cream/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-cream">{displayName}</span>
            <span className="text-xs text-stone">{formatDate(comment.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            {depth < 2 && (
              <button
                onClick={() => setReplying(!replying)}
                className="text-xs text-stone hover:text-terracotta transition-colors"
              >
                Reply
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-xs text-stone hover:text-terracotta transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-cream/80 whitespace-pre-wrap">{comment.body}</p>
      </div>

      {replying && (
        <div className="mt-3 ml-6">
          <CommentForm
            discussionId={discussionId}
            contentId={contentId}
            parentId={comment.id}
            userId={userId}
            onCancel={() => setReplying(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={allComments.filter((c) => c.parent_id === reply.id)}
              allComments={allComments}
              discussionId={discussionId}
              contentId={contentId}
              userId={userId}
              isAdmin={isAdmin}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
