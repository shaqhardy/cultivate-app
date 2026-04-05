import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function MyLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("content_id, content(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-4xl text-cream mb-8">My Library</h1>

      {bookmarks && bookmarks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((b) => {
            const item = b.content as unknown as Record<string, string | string[] | boolean>;
            if (!item) return null;
            return (
              <Link key={b.content_id} href={`/library/${b.content_id}`}>
                <Card className="h-full hover:border-stone/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant={item.access_level === "paid" ? "paid" : "free"}>
                      {item.access_level as string}
                    </Badge>
                    <Badge>
                      {item.content_type === "pdf" ? "PDF" : (item.content_type as string)}
                    </Badge>
                  </div>
                  <h2 className="font-display text-xl text-cream uppercase mb-2">
                    {item.title as string}
                  </h2>
                  {item.description && (
                    <p className="text-sm text-stone line-clamp-2">
                      {item.description as string}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-stone mb-4">You haven&apos;t saved anything yet.</p>
          <Link
            href="/library"
            className="text-terracotta hover:underline text-sm"
          >
            Browse the library
          </Link>
        </div>
      )}
    </div>
  );
}
