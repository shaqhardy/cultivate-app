import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

function StageBadge({ stage }: { stage: string }) {
  const styles: Record<string, string> = {
    inquiry: "bg-stone/20 text-stone",
    review: "bg-cream/10 text-cream",
    approved: "bg-terracotta/15 text-terracotta",
    deposit_paid: "bg-green-400/15 text-green-400",
    confirmed: "bg-green-400/15 text-green-400",
    completed: "bg-cream/10 text-cream",
    canceled: "bg-stone/20 text-stone line-through",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${styles[stage] ?? styles.inquiry}`}
    >
      {stage.replace("_", " ")}
    </span>
  );
}

export default async function BookingsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, event_name, host_name, event_date, stage, event_type")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-cream">
          Bookings
        </h1>
        <Link
          href="/admin/bookings/new"
          className="rounded-lg bg-terracotta px-4 py-2.5 font-display text-sm uppercase text-cream transition-colors hover:bg-terracotta/90"
        >
          New Event
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone/20">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone/20 bg-cream/5">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-stone">
                Event
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-stone">
                Host
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-stone">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-stone">
                Type
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-stone">
                Stage
              </th>
            </tr>
          </thead>
          <tbody>
            {events && events.length > 0 ? (
              events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-stone/10 transition-colors hover:bg-cream/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bookings/${event.id}`}
                      className="text-cream hover:text-terracotta transition-colors"
                    >
                      {event.event_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone">{event.host_name}</td>
                  <td className="px-4 py-3 text-stone">
                    {event.event_date ? formatDate(event.event_date) : "TBD"}
                  </td>
                  <td className="px-4 py-3 text-stone capitalize">
                    {event.event_type}
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={event.stage} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-stone"
                >
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
