import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BookmarkButton } from "./bookmark-button";

export default async function ContentDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const { data: item } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!item) notFound();

  // Check access
  const hasAccess =
    item.access_level === "free" ||
    profile?.role === "paid_member" ||
    profile?.role === "admin";

  // Check if bookmarked
  const { data: bookmark } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user!.id)
    .eq("content_id", id)
    .single();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <Badge variant={item.access_level === "paid" ? "paid" : "free"}>
          {item.access_level}
        </Badge>
        <Badge>{item.content_type === "pdf" ? "PDF" : item.content_type}</Badge>
        {item.series && <Badge>{item.series}</Badge>}
      </div>

      <h1 className="text-5xl text-cream mb-4">{item.title}</h1>

      <div className="flex items-center gap-4 mb-8 text-sm text-stone">
        {item.book_of_bible && <span>{item.book_of_bible}</span>}
        <span>{formatDate(item.created_at)}</span>
        <BookmarkButton
          contentId={id}
          userId={user!.id}
          initialBookmarked={!!bookmark}
        />
      </div>

      {!hasAccess ? (
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-8 text-center">
          <h2 className="font-display text-2xl text-cream uppercase mb-2">
            Premium Content
          </h2>
          <p className="text-stone mb-4">
            Upgrade to a paid membership to access this resource.
          </p>
          <a
            href="/settings"
            className="inline-block rounded-lg bg-terracotta px-6 py-3 font-display uppercase text-cream hover:bg-terracotta/90 transition-colors"
          >
            Upgrade
          </a>
        </div>
      ) : (
        <div>
          {/* Video embed */}
          {item.content_type === "video" && item.embed_url && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden">
              <iframe
                src={item.embed_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Audio embed */}
          {item.content_type === "audio" && item.embed_url && (
            <div className="mb-8">
              <audio controls src={item.embed_url} className="w-full" />
            </div>
          )}

          {/* PDF download */}
          {item.content_type === "pdf" && item.file_url && (
            <div className="mb-8">
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-terracotta px-6 py-3 font-display uppercase text-cream hover:bg-terracotta/90 transition-colors"
              >
                Download PDF
              </a>
            </div>
          )}

          {/* Article body */}
          {item.body && (
            <div className="prose prose-invert max-w-none text-cream/90 leading-relaxed whitespace-pre-wrap">
              {item.body}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone/20 flex flex-wrap gap-2">
              {item.tags.map((tag: string) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
