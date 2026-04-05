"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

const CART_KEY = "cultivate_cart";

function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  function updateQuantity(productId: string, delta: number) {
    const updated = cart
      .map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCart(updated);
    saveCart(updated);
  }

  function removeItem(productId: string) {
    const updated = cart.filter((item) => item.productId !== productId);
    setCart(updated);
    saveCart(updated);
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/merch-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="font-display text-4xl uppercase text-cream">
          Your Cart
        </h1>
        <p className="text-stone">Your cart is empty.</p>
        <Link
          href="/store"
          className="inline-block rounded-lg bg-terracotta px-6 py-3 font-display uppercase text-cream transition-opacity hover:opacity-90"
        >
          Browse Store
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-cream">
          Your Cart
        </h1>
        <Link
          href="/store"
          className="text-sm text-stone hover:text-cream transition-colors"
        >
          &larr; Continue Shopping
        </Link>
      </div>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between rounded-xl border border-stone/20 bg-black p-4"
          >
            <div className="flex-1">
              <h3 className="font-display text-lg uppercase text-cream">
                {item.productName}
              </h3>
              <p className="text-sm text-stone">
                ${(item.price / 100).toFixed(2)} each
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.productId, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone/30 text-cream transition-colors hover:border-stone/50"
              >
                -
              </button>
              <span className="w-8 text-center text-cream">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.productId, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone/30 text-cream transition-colors hover:border-stone/50"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.productId)}
                className="ml-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stone/20 bg-black p-6 space-y-4">
        <div className="flex items-center justify-between text-lg">
          <span className="text-stone">Subtotal</span>
          <span className="font-display text-2xl text-cream">
            ${(subtotal / 100).toFixed(2)}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-lg bg-terracotta px-6 py-3 font-display text-lg uppercase text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Redirecting..." : "Checkout"}
        </button>
      </div>
    </div>
  );
}
