import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <span className="font-display text-2xl text-brand font-bold tracking-tight">
          Cheers
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-muted hover:text-fg transition-colors text-sm font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-hover transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Now available
          </div>
          <h1 className="font-display text-6xl lg:text-7xl text-fg leading-[1.05] tracking-tight mb-6">
            Raise a glass to
            <br />
            <em className="text-brand not-italic">new connections</em>
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-10 max-w-md">
            Meet interesting people nearby. Swipe, match, and start a real
            conversation — no noise, just people worth your time.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="bg-brand text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-brand-hover transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand/20"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="text-fg font-medium flex items-center gap-2 hover:gap-3 transition-all"
            >
              Sign in <span>→</span>
            </Link>
            <Link
              href="/login?demo=true"
              className="text-muted text-sm font-medium hover:text-fg transition-colors underline underline-offset-2"
            >
              Continue as guest
            </Link>
          </div>
        </div>

        {/* Decorative card stack */}
        <div className="relative h-96 hidden lg:block">
          <div className="absolute top-0 right-8 w-56 h-72 bg-brand rounded-3xl rotate-6 opacity-10" />
          <div className="absolute top-4 right-12 w-56 h-72 bg-gold rounded-3xl rotate-3 opacity-15" />
          <div className="absolute top-8 right-16 w-56 h-72 bg-ink rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-full bg-gradient-to-b from-transparent to-ink/80 flex flex-col justify-end p-5">
              <div className="w-8 h-8 rounded-full bg-gold mb-3" />
              <div className="h-3 bg-white/30 rounded-full w-24 mb-2" />
              <div className="h-2 bg-white/20 rounded-full w-16" />
            </div>
          </div>
          <div className="absolute bottom-8 left-0 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-line">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-lg">
              🥂
            </div>
            <div>
              <div className="text-sm font-semibold text-fg">
                It&apos;s a match!
              </div>
              <div className="text-xs text-muted">
                You and someone special matched
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink text-white py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="font-display text-4xl text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Create your profile",
                desc: "Upload photos and write a bit about yourself. Be authentic — it works.",
              },
              {
                n: "02",
                title: "Discover people",
                desc: "Browse profiles of real people nearby. Like who interests you.",
              },
              {
                n: "03",
                title: "Start talking",
                desc: "When you both like each other — it's a match. Say hello.",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="border border-white/10 rounded-2xl p-8 hover:border-gold/40 transition-colors"
              >
                <div className="font-display text-5xl text-gold/40 mb-4">
                  {n}
                </div>
                <h3 className="font-display text-xl text-white mb-3">
                  {title}
                </h3>
                <p className="text-white/50 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted text-sm">
        © {new Date().getFullYear()} Cheers. All rights reserved.
      </footer>
    </main>
  );
}
