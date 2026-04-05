export function Footer() {
  return (
    <footer className="border-t border-stone/20 bg-black py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-stone">
          &copy; {new Date().getFullYear()} Shaq Hardy. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a
            href="https://youtube.com/@shaqhardy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone hover:text-cream transition-colors"
          >
            YouTube
          </a>
          <a
            href="https://instagram.com/shaqhardy_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone hover:text-cream transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://tiktok.com/@shaqhardy_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone hover:text-cream transition-colors"
          >
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}
