"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CommentForm({
  discussionId,
  contentId,
  parentId,
  userId,
  onCancel,
  placeholder = "Share your thoughts...",
}: {
  discussionId?: string;
  contentId?: string;
  parentId?: string;
  userId: string;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);

    await supabase.from("comments").insert({
      body: body.trim(),
      user_id: userId,
      discussion_id: discussionId || null,
      content_id: contentId || null,
      parent_id: parentId || null,
    });

    setBody("");
    setLoading(false);
    router.refresh();
    onCancel?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream text-sm placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta resize-none"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || !body.trim()}>
          {loading ? "Posting..." : "Post"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
