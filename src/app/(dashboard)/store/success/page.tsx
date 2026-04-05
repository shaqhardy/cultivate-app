"use client";

import { useEffect } from "react";
import Link from "next/link";

const CART_KEY = "cultivate_cart";

export default function StoreSuccessPage() {
  useEffect(() => {
    localStorage.removeItem(CART_KEY);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
        <svg
          className="h-8 w-8 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="font-display text-4xl uppercase text-cream">
        Order Confirmed
      </h1>
      <p className="max-w-md text-stone">
        Thank you for your purchase! You will receive a confirmation email
        shortly. We will notify you when your order ships.
      </p>

      <Link
        href="/store"
        className="rounded-lg bg-terracotta px-6 py-3 font-display uppercase text-cream transition-opacity hover:opacity-90"
      >
        Back to Store
      </Link>
    </div>
  );
}
