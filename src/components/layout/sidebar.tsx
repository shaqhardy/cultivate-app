"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const navItems = [
  { href: "/library", label: "Library" },
  { href: "/my-library", label: "My Library" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between border-b border-stone/20 bg-black px-4 py-3">
        <Wordmark className="text-xl" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-cream p-2"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-stone/20 bg-black flex flex-col transition-transform lg:translate-x-0 lg:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <Wordmark />
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-cream/10 text-cream"
                  : "text-stone hover:text-cream hover:bg-cream/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-stone/20">
          <button
            onClick={handleSignOut}
            className="w-full text-left rounded-lg px-3 py-2.5 text-sm text-stone hover:text-cream hover:bg-cream/5 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
