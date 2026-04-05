import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 lg:px-10">
        <Wordmark />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-stone hover:text-cream transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-terracotta px-4 py-2 font-display text-sm uppercase text-cream hover:bg-terracotta/90 transition-colors"
          >
            Join Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl text-cream leading-none mb-6">
            Grow with
            <br />
            <span className="text-terracotta">Intention</span>
          </h1>
          <p className="text-lg text-stone max-w-xl mx-auto mb-10 font-body leading-relaxed">
            Preaching the Word. Teaching the truth. Cultivating faithfulness.
            A community for those who want to go deeper in Scripture.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-terracotta px-8 py-4 font-display text-lg uppercase text-cream hover:bg-terracotta/90 transition-colors"
            >
              Join the Community
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-stone/30 px-8 py-4 font-display text-lg uppercase text-cream hover:border-cream/50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* What You Get */}
      <section className="border-t border-stone/20 py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <h2 className="text-4xl text-cream text-center mb-12">
            What&apos;s Inside
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-terracotta font-display text-5xl mb-3">01</div>
              <h3 className="font-display text-xl text-cream uppercase mb-2">
                Bible Studies
              </h3>
              <p className="text-sm text-stone">
                Deep dives into Scripture. Articles, videos, and audio that take
                the text seriously.
              </p>
            </div>
            <div className="text-center">
              <div className="text-terracotta font-display text-5xl mb-3">02</div>
              <h3 className="font-display text-xl text-cream uppercase mb-2">
                Downloadable Resources
              </h3>
              <p className="text-sm text-stone">
                Study guides, reading plans, and PDFs you can use on your own or
                with your small group.
              </p>
            </div>
            <div className="text-center">
              <div className="text-terracotta font-display text-5xl mb-3">03</div>
              <h3 className="font-display text-xl text-cream uppercase mb-2">
                Premium Content
              </h3>
              <p className="text-sm text-stone">
                Paid members get access to exclusive teaching, in-depth series,
                and bonus material.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone/20 py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-4xl text-cream mb-4">Start Free</h2>
          <p className="text-stone mb-8">
            Create a free account. Access the content library. Upgrade when
            you&apos;re ready.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-terracotta px-8 py-4 font-display text-lg uppercase text-cream hover:bg-terracotta/90 transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
