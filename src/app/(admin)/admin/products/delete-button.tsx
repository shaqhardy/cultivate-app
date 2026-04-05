"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert("Failed to delete product: " + error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 transition-colors"
    >
      Delete
    </button>
  );
}
