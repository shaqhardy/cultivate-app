import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CommentForm } from "@/components/community/comment-form";
import { CommentList } from "@/components/community/comment-list";
import { DeleteDiscussionButton } from "./delete-button";
import Link from "next/link";

export default async function DiscussionDetailPage(props: {
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

  const { data: discussion } = await supabase
    .from("discussions")
    .select("*, profiles(full_name, email)")
    .eq("id", id)
    .single();

  if (!discussion) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(full_name, email)")
    .eq("discussion_id", id)
    .order("created_at", { ascending: true });

  const author =
    (discussion.profiles as { full_name: string | null; email: string } | null)
      ?.full_name ||
    (discussion.profiles as { email: string } | null)?.email ||
    "Member";

  const isAdmin = profile?.role === "admin";
  const canDelete = discussion.user_id === user!.id || isAdmin;

  return (
    <div className="max-w-3xl">
      <Link
        href="/community"
        className="text-sm text-stone hover:text-cream transition-colors mb-6 inline-block"
      >
        &larr; Back to Community
      </Link>

      <Card className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {discussion.pinned && (
              <span className="text-xs text-terracotta font-medium uppercase tracking-wide">
                Pinned
              </span>
            )}
            <h1 className="text-3xl text-cream">{discussion.title}</h1>
          </div>
          {canDelete && <DeleteDiscussionButton id={discussion.id} />}
        </div>
        <p className="text-cream/80 whitespace-pre-wrap mb-4">{discussion.body}</p>
        <div className="flex items-center gap-3 text-xs text-stone">
          <span>{author}</span>
          <span>{formatDate(discussion.created_at)}</span>
        </div>
      </Card>

      <div className="mb-6">
        <h2 className="font-display text-xl text-cream uppercase mb-4">
          {comments?.length || 0} {comments?.length === 1 ? "Reply" : "Replies"}
        </h2>
        <CommentForm
          discussionId={id}
          userId={user!.id}
          placeholder="Join the discussion..."
        />
      </div>

      {comments && comments.length > 0 && (
        <CommentList
          comments={comments as never[]}
          discussionId={id}
          userId={user!.id}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
