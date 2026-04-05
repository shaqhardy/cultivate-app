"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface Subscription {
  status: string;
  current_period_end: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (p) {
        setProfile(p);
        setFullName(p.full_name || "");
      }

      const { data: s } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      if (s) setSubscription(s);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    setSaving(false);
    setMessage(error ? "Failed to update." : "Saved.");
  }

  async function handleManageSubscription() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  async function handleSubscribe() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  if (!profile) {
    return <div className="text-stone">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl text-cream mb-8">Settings</h1>

      <Card className="mb-6">
        <h2 className="font-display text-xl text-cream uppercase mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              Email
            </label>
            <p className="text-stone text-sm">{profile.email}</p>
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-cream mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            {message && <span className="text-sm text-stone">{message}</span>}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl text-cream uppercase mb-4">
          Subscription
        </h2>
        {subscription ? (
          <div className="space-y-3">
            <p className="text-sm text-cream">
              Status:{" "}
              <span className="text-terracotta capitalize">
                {subscription.status}
              </span>
            </p>
            <p className="text-sm text-stone">
              Current period ends:{" "}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
            <Button variant="secondary" onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-stone">
              You&apos;re on the free plan. Upgrade for premium Bible studies,
              downloadable resources, and more.
            </p>
            <Button onClick={handleSubscribe}>Upgrade to Premium</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
