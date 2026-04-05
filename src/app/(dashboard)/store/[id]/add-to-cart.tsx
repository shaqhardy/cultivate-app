"use client";

import { useState } from "react";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

const CART_KEY = "cultivate_cart";

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
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

export function AddToCart({
  productId,
  productName,
  price,
  stock,
}: {
  productId: string;
  productName: string;
  price: number;
  stock: number;
}) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (stock <= 0) return;

    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
      if (existing.quantity >= stock) return;
      existing.quantity += 1;
    } else {
      cart.push({ productId, productName, price, quantity: 1 });
    }

    saveCart(cart);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={stock <= 0}
      className="w-full rounded-lg bg-terracotta px-6 py-3 font-display text-lg uppercase text-cream transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {stock <= 0 ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
    </button>
  );
}
