import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DeleteProductButton } from "./delete-button";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase text-cream">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-terracotta px-4 py-2 font-display uppercase text-cream text-sm transition-opacity hover:opacity-90"
        >
          New Product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="text-stone">No products yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone/20">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone/20">
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Name
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Price
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Stock
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Category
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Active
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-stone/10 last:border-0"
                >
                  <td className="px-4 py-3 text-sm text-cream">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-cream">
                    ${(product.price / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-cream">
                    {product.stock}
                  </td>
                  <td className="px-4 py-3 text-sm text-stone">
                    {product.category || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {product.active ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-red-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-terracotta hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
