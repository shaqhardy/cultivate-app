"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DeleteDiscussionButton({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this discussion and all its replies?")) return;
    await supabase.from("discussions").delete().eq("id", id);
    router.push("/community");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-stone hover:text-terracotta transition-colors shrink-0"
    >
      Delete
    </button>
  );
}
