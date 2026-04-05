import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/library");

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-stone/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Wordmark />
          <span className="text-xs uppercase tracking-wider text-terracotta font-display">
            Admin
          </span>
        </div>
        <nav className="flex gap-4">
          <Link
            href="/admin"
            className="text-sm text-stone hover:text-cream transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/content"
            className="text-sm text-stone hover:text-cream transition-colors"
          >
            Content
          </Link>
          <Link
            href="/library"
            className="text-sm text-stone hover:text-cream transition-colors"
          >
            Back to App
          </Link>
        </nav>
      </header>
      <main className="p-6 lg:p-10">{children}</main>
    </div>
  );
}
