import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function LibraryPage(props: {
  searchParams: Promise<{ type?: string; access?: string; tag?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile for role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  let query = supabase
    .from("content")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  // Free members can only see free content
  if (profile?.role === "free_member") {
    query = query.eq("access_level", "free");
  }

  if (searchParams.type) {
    query = query.eq("content_type", searchParams.type);
  }

  if (searchParams.access && profile?.role !== "free_member") {
    query = query.eq("access_level", searchParams.access);
  }

  if (searchParams.tag) {
    query = query.contains("tags", [searchParams.tag]);
  }

  const { data: content } = await query;

  const types = ["article", "video", "pdf", "audio"];

  return (
    <div>
      <h1 className="text-4xl text-cream mb-8">Content Library</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/library"
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            !searchParams.type
              ? "bg-cream/10 text-cream"
              : "text-stone hover:text-cream"
          }`}
        >
          All
        </Link>
        {types.map((type) => (
          <Link
            key={type}
            href={`/library?type=${type}`}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
              searchParams.type === type
                ? "bg-cream/10 text-cream"
                : "text-stone hover:text-cream"
            }`}
          >
            {type === "pdf" ? "PDF" : type}
          </Link>
        ))}
      </div>

      {/* Content grid */}
      {content && content.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.map((item) => (
            <Link key={item.id} href={`/library/${item.id}`}>
              <Card className="h-full hover:border-stone/40 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant={item.access_level === "paid" ? "paid" : "free"}>
                    {item.access_level}
                  </Badge>
                  <Badge>{item.content_type === "pdf" ? "PDF" : item.content_type}</Badge>
                </div>
                <h2 className="font-display text-xl text-cream uppercase mb-2">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="text-sm text-stone line-clamp-2">{item.description}</p>
                )}
                {item.book_of_bible && (
                  <p className="mt-3 text-xs text-stone">{item.book_of_bible}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-stone">No content available yet.</p>
        </div>
      )}
    </div>
  );
}
