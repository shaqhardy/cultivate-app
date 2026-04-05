"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Sync to Kit (ConvertKit) email list
    try {
      await fetch("/api/kit/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName }),
      });
    } catch {
      // Non-blocking: don't fail signup if Kit sync fails
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-4xl text-cream mb-4">Check Your Email</h1>
        <p className="text-stone text-sm">
          We sent a confirmation link to <span className="text-cream">{email}</span>.
          Click it to finish signing up.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl text-cream text-center mb-2">Create Account</h1>
      <p className="text-stone text-center mb-8 font-body text-sm">
        Join the Cultivate community.
      </p>

      {error && (
        <div className="bg-terracotta/10 border border-terracotta text-terracotta text-sm rounded-lg p-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-cream mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            placeholder="Your name"
          />
        </div>
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
            minLength={8}
            className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            placeholder="At least 8 characters"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-terracotta px-4 py-3 font-display text-lg uppercase text-cream hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating account..." : "Sign Up"}
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
        onClick={handleGoogleSignup}
        className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream hover:border-cream/50 transition-colors text-sm font-medium"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-stone">
        Already have an account?{" "}
        <Link href="/login" className="text-terracotta hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
