"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewContentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const tags = (form.get("tags") as string)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase.from("content").insert({
      title: form.get("title") as string,
      description: form.get("description") as string,
      body: form.get("body") as string,
      content_type: form.get("content_type") as string,
      embed_url: (form.get("embed_url") as string) || null,
      file_url: (form.get("file_url") as string) || null,
      access_level: form.get("access_level") as string,
      tags,
      book_of_bible: (form.get("book_of_bible") as string) || null,
      series: (form.get("series") as string) || null,
      published: form.get("published") === "on",
      created_by: user!.id,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/content");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl text-cream mb-8">New Content</h1>

      {error && (
        <div className="bg-terracotta/10 border border-terracotta text-terracotta text-sm rounded-lg p-3 mb-6">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-cream mb-1">
              Title *
            </label>
            <input
              id="title"
              name="title"
              required
              className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-cream mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="content_type" className="block text-sm font-medium text-cream mb-1">
                Type *
              </label>
              <select
                id="content_type"
                name="content_type"
                required
                className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div>
              <label htmlFor="access_level" className="block text-sm font-medium text-cream mb-1">
                Access Level *
              </label>
              <select
                id="access_level"
                name="access_level"
                required
                className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-cream mb-1">
              Body (for articles)
            </label>
            <textarea
              id="body"
              name="body"
              rows={10}
              className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            />
          </div>

          <div>
            <label htmlFor="embed_url" className="block text-sm font-medium text-cream mb-1">
              Embed URL (video/audio)
            </label>
            <input
              id="embed_url"
              name="embed_url"
              type="url"
              className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
              placeholder="https://youtube.com/embed/..."
            />
          </div>

          <div>
            <label htmlFor="file_url" className="block text-sm font-medium text-cream mb-1">
              File URL (PDF)
            </label>
            <input
              id="file_url"
              name="file_url"
              type="url"
              className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="book_of_bible" className="block text-sm font-medium text-cream mb-1">
                Book of the Bible
              </label>
              <input
                id="book_of_bible"
                name="book_of_bible"
                className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                placeholder="Genesis"
              />
            </div>
            <div>
              <label htmlFor="series" className="block text-sm font-medium text-cream mb-1">
                Series
              </label>
              <input
                id="series"
                name="series"
                className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-cream mb-1">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              className="w-full rounded-lg border border-stone/30 bg-black px-4 py-3 text-cream placeholder:text-stone/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
              placeholder="faith, prayer, anxiety"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              name="published"
              className="rounded border-stone/30 bg-black text-terracotta focus:ring-terracotta"
            />
            <label htmlFor="published" className="text-sm text-cream">
              Publish immediately
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Content"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
