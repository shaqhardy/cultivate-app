"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EVENT_TYPES = ["speaking", "workshop", "panel", "conference", "other"];

const inputClass =
  "w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta";

export default function NewBookingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const depositDollars = parseFloat(form.get("deposit_amount") as string) || 0;
    const totalDollars = parseFloat(form.get("total_fee") as string) || 0;

    const payload = {
      host_name: form.get("host_name") as string,
      host_email: form.get("host_email") as string,
      host_phone: form.get("host_phone") as string,
      organization: form.get("organization") as string,
      event_name: form.get("event_name") as string,
      event_type: form.get("event_type") as string,
      event_date: (form.get("event_date") as string) || null,
      event_time: (form.get("event_time") as string) || null,
      location: form.get("location") as string,
      virtual: form.get("virtual") === "on",
      audience_size: parseInt(form.get("audience_size") as string) || null,
      description: form.get("description") as string,
      deposit_amount: Math.round(depositDollars * 100),
      total_fee: Math.round(totalDollars * 100),
      stage: "inquiry",
    };

    const { error: insertError } = await supabase
      .from("events")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/bookings");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 font-display text-4xl uppercase text-cream">
        New Event
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Host Info */}
          <div className="space-y-4">
            <h2 className="font-display text-lg uppercase text-cream">
              Host Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-stone">
                  Host Name *
                </label>
                <input
                  name="host_name"
                  required
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">
                  Email *
                </label>
                <input
                  name="host_email"
                  type="email"
                  required
                  placeholder="host@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">Phone</label>
                <input
                  name="host_phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">
                  Organization
                </label>
                <input
                  name="organization"
                  placeholder="Church or org name"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h2 className="font-display text-lg uppercase text-cream">
              Event Details
            </h2>
            <div>
              <label className="mb-1 block text-sm text-stone">
                Event Name *
              </label>
              <input
                name="event_name"
                required
                placeholder="Event title"
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-stone">Type *</label>
                <select name="event_type" required className={inputClass}>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">
                  Audience Size
                </label>
                <input
                  name="audience_size"
                  type="number"
                  placeholder="Expected attendees"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-stone">Date</label>
                <input name="event_date" type="date" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">Time</label>
                <input name="event_time" type="time" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone">Location</label>
              <input
                name="location"
                placeholder="Venue address"
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-cream">
              <input
                name="virtual"
                type="checkbox"
                className="h-4 w-4 rounded border-stone/30 bg-black accent-terracotta"
              />
              Virtual event
            </label>
            <div>
              <label className="mb-1 block text-sm text-stone">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Event details, special requirements..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-4">
            <h2 className="font-display text-lg uppercase text-cream">
              Financials
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-stone">
                  Deposit Amount ($)
                </label>
                <input
                  name="deposit_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">
                  Total Fee ($)
                </label>
                <input
                  name="total_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Event"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/admin/bookings")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
