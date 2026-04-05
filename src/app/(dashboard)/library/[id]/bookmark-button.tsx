"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function BookmarkButton({
  contentId,
  userId,
  initialBookmarked,
}: {
  contentId: string;
  userId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    if (bookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("content_id", contentId);
      setBookmarked(false);
    } else {
      await supabase
        .from("bookmarks")
        .insert({ user_id: userId, content_id: contentId });
      setBookmarked(true);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="text-sm text-stone hover:text-terracotta transition-colors disabled:opacity-50"
    >
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
