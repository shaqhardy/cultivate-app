import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToCart } from "./add-to-cart";

export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!product) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/store"
        className="inline-flex items-center gap-1 text-sm text-stone hover:text-cream transition-colors"
      >
        &larr; Back to Store
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-96 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-96 w-full items-center justify-center rounded-xl bg-cream/5 border border-stone/20">
            <span className="text-stone/50">No image</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h1 className="font-display text-4xl uppercase text-cream">
              {product.name}
            </h1>
            <p className="mt-2 text-2xl font-medium text-cream">
              ${(product.price / 100).toFixed(2)}
            </p>
          </div>

          {product.description && (
            <p className="text-stone leading-relaxed">{product.description}</p>
          )}

          <div className="text-sm text-stone">
            {product.stock > 0 ? (
              <span className="text-green-400">
                In stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-400">Out of stock</span>
            )}
          </div>

          <AddToCart
            productId={product.id}
            productName={product.name}
            price={product.price}
            stock={product.stock}
          />
        </div>
      </div>
    </div>
  );
}
