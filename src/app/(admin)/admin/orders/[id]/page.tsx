"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta";

interface Order {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  tracking_number: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

const STATUSES = ["pending", "paid", "shipped", "delivered", "canceled"];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).single(),
        supabase.from("order_items").select("*").eq("order_id", id),
      ]);

      if (orderRes.data) {
        setOrder(orderRes.data);
        setStatus(orderRes.data.status);
        setTrackingNumber(orderRes.data.tracking_number || "");
      }
      if (itemsRes.data) {
        setItems(itemsRes.data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        tracking_number: trackingNumber || null,
      })
      .eq("id", id);

    if (error) {
      alert("Failed to update order: " + error.message);
    } else {
      router.refresh();
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-stone">Loading...</p>;
  }

  if (!order) {
    return <p className="text-red-400">Order not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase text-cream">
          Order Details
        </h1>
        <Link
          href="/admin/orders"
          className="text-sm text-stone hover:text-cream transition-colors"
        >
          &larr; Back to Orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Info */}
        <div className="rounded-xl border border-stone/20 p-6 space-y-4">
          <h2 className="font-display text-xl uppercase text-cream">
            Info
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-stone">Order ID:</span>{" "}
              <span className="text-cream">{order.id}</span>
            </p>
            <p>
              <span className="text-stone">Date:</span>{" "}
              <span className="text-cream">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </p>
            <p>
              <span className="text-stone">Subtotal:</span>{" "}
              <span className="text-cream">
                ${(order.subtotal / 100).toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="rounded-xl border border-stone/20 p-6 space-y-4">
          <h2 className="font-display text-xl uppercase text-cream">
            Shipping
          </h2>
          <div className="space-y-1 text-sm text-cream">
            {order.shipping_name && <p>{order.shipping_name}</p>}
            {order.shipping_address && <p>{order.shipping_address}</p>}
            <p>
              {[order.shipping_city, order.shipping_state, order.shipping_zip]
                .filter(Boolean)
                .join(", ")}
            </p>
            {order.shipping_country && <p>{order.shipping_country}</p>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-stone/20 p-6 space-y-4">
        <h2 className="font-display text-xl uppercase text-cream">Items</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-stone/10 py-2 last:border-0"
            >
              <div>
                <p className="text-sm text-cream">{item.product_name}</p>
                <p className="text-xs text-stone">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm text-cream">
                ${((item.unit_price * item.quantity) / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status */}
      <div className="rounded-xl border border-stone/20 p-6 space-y-4">
        <h2 className="font-display text-xl uppercase text-cream">
          Update Order
        </h2>

        <div>
          <label className="mb-1.5 block text-sm text-stone">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-stone">
            Tracking Number
          </label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className={inputClass}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-terracotta px-6 py-3 font-display uppercase text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
