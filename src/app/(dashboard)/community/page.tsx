import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data: discussions } = await supabase
    .from("discussions")
    .select("*, profiles(full_name, email)")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  // Get comment counts per discussion
  const { data: commentCounts } = await supabase
    .from("comments")
    .select("discussion_id")
    .not("discussion_id", "is", null);

  const countMap: Record<string, number> = {};
  commentCounts?.forEach((c) => {
    if (c.discussion_id) {
      countMap[c.discussion_id] = (countMap[c.discussion_id] || 0) + 1;
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl text-cream">Community</h1>
        <Link
          href="/community/new"
          className="rounded-lg bg-terracotta px-4 py-2.5 font-display uppercase text-sm text-cream hover:bg-terracotta/90 transition-colors"
        >
          New Discussion
        </Link>
      </div>

      {discussions && discussions.length > 0 ? (
        <div className="space-y-3">
          {discussions.map((d) => {
            const author =
              (d.profiles as { full_name: string | null; email: string } | null)
                ?.full_name ||
              (d.profiles as { email: string } | null)?.email ||
              "Member";
            return (
              <Link key={d.id} href={`/community/${d.id}`}>
                <Card className="hover:border-stone/40 transition-colors mb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {d.pinned && (
                          <span className="text-xs text-terracotta font-medium uppercase tracking-wide">
                            Pinned
                          </span>
                        )}
                        <h2 className="font-display text-xl text-cream uppercase truncate">
                          {d.title}
                        </h2>
                      </div>
                      <p className="text-sm text-stone line-clamp-2">{d.body}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-stone">
                        <span>{author}</span>
                        <span>{formatDate(d.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-center shrink-0 pt-1">
                      <div className="text-2xl font-display text-cream">
                        {countMap[d.id] || 0}
                      </div>
                      <div className="text-xs text-stone">replies</div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-stone mb-4">No discussions yet. Start the first one.</p>
          <Link
            href="/community/new"
            className="text-terracotta hover:underline text-sm"
          >
            Start a discussion
          </Link>
        </div>
      )}
    </div>
  );
}
