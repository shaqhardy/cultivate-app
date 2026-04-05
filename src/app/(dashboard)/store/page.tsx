import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function StorePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-cream">Store</h1>
        <Link
          href="/store/cart"
          className="rounded-lg bg-cream/5 px-4 py-2 text-sm text-cream transition-colors hover:bg-cream/10"
        >
          View Cart
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="text-stone">No products available yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/store/${product.id}`}>
              <Card className="group cursor-pointer transition-colors hover:border-stone/40">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="mb-4 h-48 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-48 w-full items-center justify-center rounded-lg bg-cream/5">
                    <span className="text-stone/50 text-sm">No image</span>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-xl uppercase text-cream group-hover:text-terracotta transition-colors">
                      {product.name}
                    </h2>
                    {product.category && (
                      <Badge>{product.category}</Badge>
                    )}
                  </div>
                  <p className="text-lg font-medium text-cream">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
