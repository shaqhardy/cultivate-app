import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DeleteContentButton } from "./delete-button";

export default async function AdminContentPage() {
  const supabase = await createClient();

  const { data: content } = await supabase
    .from("content")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl text-cream">Content</h1>
        <Link
          href="/admin/content/new"
          className="rounded-lg bg-terracotta px-4 py-2.5 font-display uppercase text-sm text-cream hover:bg-terracotta/90 transition-colors"
        >
          New Content
        </Link>
      </div>

      <div className="border border-stone/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone/20">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone font-medium">
                Title
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone font-medium">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone font-medium">
                Access
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone font-medium">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone font-medium">
                Date
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {content?.map((item) => (
              <tr
                key={item.id}
                className="border-b border-stone/10 hover:bg-cream/5"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/content/${item.id}`}
                    className="text-sm text-cream hover:text-terracotta transition-colors"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge>{item.content_type === "pdf" ? "PDF" : item.content_type}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={item.access_level === "paid" ? "paid" : "free"}>
                    {item.access_level}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs ${
                      item.published ? "text-green-400" : "text-stone"
                    }`}
                  >
                    {item.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-stone">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-4 py-3">
                  <DeleteContentButton id={item.id} />
                </td>
              </tr>
            ))}
            {(!content || content.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone text-sm">
                  No content yet. Create your first piece.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
