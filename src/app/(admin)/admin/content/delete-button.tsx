"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DeleteContentButton({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this content? This cannot be undone.")) return;
    await supabase.from("content").delete().eq("id", id);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-stone hover:text-terracotta transition-colors"
    >
      Delete
    </button>
  );
}
