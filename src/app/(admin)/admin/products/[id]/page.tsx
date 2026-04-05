"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number;
  active: boolean;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      setProduct(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const description = form.get("description") as string;
    const priceStr = form.get("price") as string;
    const image_url = form.get("image_url") as string;
    const category = form.get("category") as string;
    const stockStr = form.get("stock") as string;
    const active = form.get("active") === "on";

    const price = Math.round(parseFloat(priceStr) * 100);
    const stock = parseInt(stockStr, 10) || 0;

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description: description || null,
        price,
        image_url: image_url || null,
        category: category || null,
        stock,
        active,
      })
      .eq("id", id);

    if (error) {
      alert("Failed to update product: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/products");
  }

  if (loading) {
    return <p className="text-stone">Loading...</p>;
  }

  if (!product) {
    return <p className="text-red-400">Product not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase text-cream">
          Edit Product
        </h1>
        <Link
          href="/admin/products"
          className="text-sm text-stone hover:text-cream transition-colors"
        >
          &larr; Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm text-stone">Name</label>
          <input
            name="name"
            required
            defaultValue={product.name}
            placeholder="Product name"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-stone">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={product.description || ""}
            placeholder="Product description"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-stone">
              Price (USD)
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={(product.price / 100).toFixed(2)}
              placeholder="29.99"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-stone">Stock</label>
            <input
              name="stock"
              type="number"
              min="0"
              required
              defaultValue={product.stock}
              placeholder="100"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-stone">Image URL</label>
          <input
            name="image_url"
            type="url"
            defaultValue={product.image_url || ""}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-stone">Category</label>
          <input
            name="category"
            defaultValue={product.category || ""}
            placeholder="e.g. Apparel, Accessories"
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            name="active"
            type="checkbox"
            defaultChecked={product.active}
            className="h-4 w-4 rounded border-stone/30 bg-black text-terracotta focus:ring-terracotta"
          />
          <span className="text-sm text-cream">Active (visible in store)</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-terracotta px-6 py-3 font-display uppercase text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}
