import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles:user_id(email)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl uppercase text-cream">Orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-stone">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone/20">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone/20">
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Order ID
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Customer
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Subtotal
                </th>
                <th className="px-4 py-3 text-xs font-display uppercase tracking-wider text-stone">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const email =
                  order.profiles && typeof order.profiles === "object"
                    ? (order.profiles as { email: string }).email
                    : "—";
                return (
                  <tr
                    key={order.id}
                    className="border-b border-stone/10 last:border-0"
                  >
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-terracotta hover:underline"
                      >
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-cream">{email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={
                          order.status === "paid"
                            ? "text-green-400"
                            : order.status === "shipped"
                              ? "text-blue-400"
                              : order.status === "delivered"
                                ? "text-cream"
                                : order.status === "canceled"
                                  ? "text-red-400"
                                  : "text-stone"
                        }
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-cream">
                      ${(order.subtotal / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
