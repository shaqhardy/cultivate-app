"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STAGES = [
  "inquiry",
  "review",
  "approved",
  "deposit_paid",
  "confirmed",
  "completed",
] as const;

const EVENT_TYPES = ["speaking", "workshop", "panel", "conference", "other"];

const inputClass =
  "w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta";

type Event = Record<string, unknown>;

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setEvent(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function update(field: string, value: unknown) {
    setEvent((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setSaving(true);
    setError(null);

    const depositDollarsRaw = event.deposit_amount_dollars as string | number | undefined;
    const totalDollarsRaw = event.total_fee_dollars as string | number | undefined;

    // If user edited the dollar fields, convert; otherwise keep original cents
    const deposit_amount =
      depositDollarsRaw !== undefined
        ? Math.round(parseFloat(String(depositDollarsRaw)) * 100)
        : event.deposit_amount;
    const total_fee =
      totalDollarsRaw !== undefined
        ? Math.round(parseFloat(String(totalDollarsRaw)) * 100)
        : event.total_fee;

    const payload = {
      host_name: event.host_name,
      host_email: event.host_email,
      host_phone: event.host_phone,
      organization: event.organization,
      event_name: event.event_name,
      event_type: event.event_type,
      event_date: event.event_date || null,
      event_time: event.event_time || null,
      location: event.location,
      virtual: event.virtual,
      audience_size: event.audience_size
        ? parseInt(String(event.audience_size))
        : null,
      description: event.description,
      stage: event.stage,
      admin_notes: event.admin_notes,
      deposit_amount,
      total_fee,
    };

    const { error: updateError } = await supabase
      .from("events")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/bookings");
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this event? This cannot be undone."))
      return;

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.push("/admin/bookings");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone">Event not found.</p>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(event.stage as (typeof STAGES)[number]);

  // Dollar values for display
  const depositDollars =
    event.deposit_amount_dollars !== undefined
      ? event.deposit_amount_dollars
      : ((event.deposit_amount as number) ?? 0) / 100;
  const totalDollars =
    event.total_fee_dollars !== undefined
      ? event.total_fee_dollars
      : ((event.total_fee as number) ?? 0) / 100;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-cream">
          Edit Event
        </h1>
        <Button variant="secondary" onClick={() => router.push("/admin/bookings")}>
          Back to Bookings
        </Button>
      </div>

      {/* Stage Pipeline */}
      <Card className="mb-6">
        <h2 className="mb-4 font-display text-sm uppercase tracking-wider text-stone">
          Workflow Stage
        </h2>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((stage, i) => {
            const isCurrent = event.stage === stage;
            const isPast = currentStageIndex >= 0 && i < currentStageIndex;
            const isFuture = currentStageIndex >= 0 && i > currentStageIndex;

            let className =
              "rounded-lg px-4 py-2 text-xs font-display uppercase tracking-wider transition-colors cursor-pointer ";
            if (isCurrent) {
              className += "bg-terracotta text-cream";
            } else if (isPast) {
              className += "bg-cream/10 text-cream";
            } else if (isFuture) {
              className += "bg-stone/10 text-stone";
            } else {
              className += "bg-stone/10 text-stone";
            }

            return (
              <button
                key={stage}
                type="button"
                onClick={() => update("stage", stage)}
                className={className}
              >
                {stage.replace("_", " ")}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => update("stage", "canceled")}
            className={`rounded-lg px-4 py-2 text-xs font-display uppercase tracking-wider transition-colors cursor-pointer ${
              event.stage === "canceled"
                ? "bg-terracotta text-cream"
                : "bg-stone/10 text-stone"
            }`}
          >
            Canceled
          </button>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSave} className="space-y-6">
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
                  Host Name
                </label>
                <input
                  value={(event.host_name as string) ?? ""}
                  onChange={(e) => update("host_name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">Email</label>
                <input
                  type="email"
                  value={(event.host_email as string) ?? ""}
                  onChange={(e) => update("host_email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">Phone</label>
                <input
                  type="tel"
                  value={(event.host_phone as string) ?? ""}
                  onChange={(e) => update("host_phone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">
                  Organization
                </label>
                <input
                  value={(event.organization as string) ?? ""}
                  onChange={(e) => update("organization", e.target.value)}
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
                Event Name
              </label>
              <input
                value={(event.event_name as string) ?? ""}
                onChange={(e) => update("event_name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-stone">Type</label>
                <select
                  value={(event.event_type as string) ?? "speaking"}
                  onChange={(e) => update("event_type", e.target.value)}
                  className={inputClass}
                >
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
                  type="number"
                  value={(event.audience_size as number) ?? ""}
                  onChange={(e) => update("audience_size", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-stone">Date</label>
                <input
                  type="date"
                  value={(event.event_date as string) ?? ""}
                  onChange={(e) => update("event_date", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">Time</label>
                <input
                  type="time"
                  value={(event.event_time as string) ?? ""}
                  onChange={(e) => update("event_time", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone">Location</label>
              <input
                value={(event.location as string) ?? ""}
                onChange={(e) => update("location", e.target.value)}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-cream">
              <input
                type="checkbox"
                checked={(event.virtual as boolean) ?? false}
                onChange={(e) => update("virtual", e.target.checked)}
                className="h-4 w-4 rounded border-stone/30 bg-black accent-terracotta"
              />
              Virtual event
            </label>
            <div>
              <label className="mb-1 block text-sm text-stone">
                Description
              </label>
              <textarea
                rows={3}
                value={(event.description as string) ?? ""}
                onChange={(e) => update("description", e.target.value)}
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
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositDollars as number}
                  onChange={(e) =>
                    update("deposit_amount_dollars", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-stone">
                  Total Fee ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalDollars as number}
                  onChange={(e) =>
                    update("total_fee_dollars", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <h2 className="mb-2 font-display text-lg uppercase text-cream">
              Admin Notes
            </h2>
            <textarea
              rows={4}
              value={(event.admin_notes as string) ?? ""}
              onChange={(e) => update("admin_notes", e.target.value)}
              placeholder="Internal notes about this booking..."
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-stone/20 pt-6">
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/admin/bookings")}
              >
                Cancel
              </Button>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-red-400 transition-colors hover:text-red-300"
            >
              Delete Event
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
