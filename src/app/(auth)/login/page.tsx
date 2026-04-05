"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/library";

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div>
      <h1 className="text-4xl text-cream text-center mb-2">Sign In</h1>
      <p className="text-stone text-center mb-8 font-body text-sm">
        Welcome back to Cultivate.
      </p>

      {error && (
        <div className="bg-terracotta/10 border border-terracotta text-terracotta text-sm rounded-lg p-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-cream mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-cream mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            placeholder="Your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-terracotta px-4 py-3 font-display text-lg uppercase text-cream hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone/30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-black px-4 text-stone">or</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream hover:border-cream/50 transition-colors text-sm font-medium"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-stone">
        No account?{" "}
        <Link href="/signup" className="text-terracotta hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
