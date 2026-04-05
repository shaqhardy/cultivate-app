import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: totalContent } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true });

  const { count: publishedContent } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true })
    .eq("published", true);

  const { count: totalMembers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: paidMembers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "paid_member");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl text-cream">Admin Dashboard</h1>
        <Link
          href="/admin/content/new"
          className="rounded-lg bg-terracotta px-4 py-2.5 font-display uppercase text-sm text-cream hover:bg-terracotta/90 transition-colors"
        >
          New Content
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-stone mb-1">Total Content</p>
          <p className="text-3xl font-display text-cream">{totalContent ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-stone mb-1">Published</p>
          <p className="text-3xl font-display text-cream">{publishedContent ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-stone mb-1">Total Members</p>
          <p className="text-3xl font-display text-cream">{totalMembers ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-stone mb-1">Paid Members</p>
          <p className="text-3xl font-display text-terracotta">{paidMembers ?? 0}</p>
        </Card>
      </div>
    </div>
  );
}
