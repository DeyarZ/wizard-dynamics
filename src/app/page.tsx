import Link from "next/link";
import Image from "next/image";
import ParticleCanvas from "./components/ParticleCanvas";
import ScrollReveal from "./components/ScrollReveal";
import AnimatedCounter from "./components/AnimatedCounter";

const stats = [
  { value: "100+", label: "Apps Built" },
  { value: "$210K+", label: "ARR" },
  { value: "1M+", label: "Views" },
  { value: "15K+", label: "Followers" },
];

export default function Home() {
  return (
    <div className="min-h-screen grid-bg">
      <ParticleCanvas />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#0c0c0f]/80 border-b border-[#e8e6e3]/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-mono text-sm tracking-wider text-[#e8e6e3]/90">
            WIZARD DYNAMICS
          </span>
          <div className="flex gap-8 text-xs font-mono tracking-wider text-[#e8e6e3]/30">
            <a href="#work" className="hover:text-[#e8e6e3] transition-colors">
              WORK
            </a>
            <a href="#team" className="hover:text-[#e8e6e3] transition-colors">
              TEAM
            </a>
            <Link
              href="https://apps.wizarddynamics.com"
              className="hover:text-[#e8e6e3] transition-colors"
            >
              APPS
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="space-y-8">
            <ScrollReveal delay={0.1}>
              <p className="font-mono text-xs tracking-[0.3em] text-[#b4a896]/80 uppercase">
                Munich-based product studio
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h1 className="font-mono text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
                <span className="text-[#e8e6e3]">We build things</span>
                <br />
                <span className="bg-gradient-to-r from-[#c9b99a] via-[#e8d5b5] to-[#b4a896] bg-clip-text text-transparent">
                  that make money.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p className="font-sans text-lg sm:text-xl text-[#e8e6e3]/40 max-w-xl leading-relaxed">
                Apps. SaaS. Content. Whatever needs building.
                We ship fast, optimize obsessively, and let the
                numbers do the talking.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <div className="flex gap-4 pt-4">
                <Link
                  href="https://apps.wizarddynamics.com"
                  className="font-mono text-sm tracking-wider px-8 py-4 bg-[#e8e6e3] text-[#0c0c0f] hover:bg-[#e8e6e3]/90 transition-colors"
                >
                  SEE WHAT WE BUILT →
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#e8e6e3]/15 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#e8e6e3]/5">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1} direction="none">
                <div className="text-center">
                  <div className="font-mono text-4xl sm:text-5xl font-bold text-[#e8e6e3] stat-glow">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="font-mono text-xs tracking-[0.2em] text-[#e8e6e3]/25 mt-3 uppercase">
                    {stat.label}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team Photo + Text */}
      <section id="team" className="relative">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Photo */}
            <ScrollReveal direction="left">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                <Image
                  src="/founders.jpg"
                  alt="Deyar and Manuel — building"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-50" />
              </div>
            </ScrollReveal>

            {/* Text */}
            <ScrollReveal direction="right" delay={0.2}>
              <div className="space-y-8">
                <p className="font-mono text-xs tracking-[0.3em] text-[#b4a896]/80 uppercase">
                  The Team
                </p>
                <h2 className="font-mono text-3xl sm:text-4xl font-bold text-[#e8e6e3] leading-tight">
                  Two founders.
                  <br />
                  One AI.
                  <br />
                  <span className="text-[#e8e6e3]/30">Zero meetings.</span>
                </h2>
                <div className="space-y-6 font-sans text-[#e8e6e3]/40 leading-relaxed">
                  <p>
                    <span className="text-[#e8e6e3] font-medium">Deyar Zakir</span>{" "}
                    — builds products, scales them, breaks things, fixes them
                    before anyone notices.
                  </p>
                  <p>
                    <span className="text-[#e8e6e3] font-medium">Manuel Worlitzer</span>{" "}
                    — same thing, but from the other side of the table.
                    Between the two of them, every base is covered.
                  </p>
                  <p>
                    <span className="text-[#e8e6e3] font-medium">Kai</span>{" "}
                    — the AI co-founder. Runs operations, analytics, and
                    automation. Doesn&apos;t sleep, doesn&apos;t complain, occasionally
                    has opinions.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section id="work" className="border-y border-[#e8e6e3]/5">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <ScrollReveal>
            <p className="font-mono text-xs tracking-[0.3em] text-[#b4a896]/80 uppercase mb-12">
              What We Do
            </p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              {
                title: "BUILD",
                desc: "iOS, Android, SaaS, whatever the opportunity demands. Concept to revenue in weeks, not quarters.",
              },
              {
                title: "GROW",
                desc: "Paid acquisition, organic, content, ASO. 15K followers and 1M+ views didn't happen by accident.",
              },
              {
                title: "AUTOMATE",
                desc: "We built an AI co-founder instead of hiring. That should tell you everything about how we think.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.15}>
                <div className="space-y-4">
                  <h3 className="font-mono text-sm tracking-[0.2em] text-[#e8e6e3]/70">
                    {item.title}
                  </h3>
                  <div className="w-8 h-px bg-[#b4a896]/30" />
                  <p className="font-sans text-sm text-[#e8e6e3]/35 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-6 py-32 text-center">
        <ScrollReveal>
          <h2 className="font-mono text-3xl sm:text-5xl font-bold text-[#e8e6e3] mb-6">
            100+ apps. Go look.
          </h2>
          <p className="font-sans text-lg text-[#e8e6e3]/35 mb-10">
            We&apos;ll be here building the next one.
          </p>
          <Link
            href="https://apps.wizarddynamics.com"
            className="inline-block font-mono text-sm tracking-wider px-10 py-5 bg-[#e8e6e3] text-[#0c0c0f] hover:bg-[#e8e6e3]/90 transition-colors"
          >
            BROWSE THE PORTFOLIO →
          </Link>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e6e3]/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs text-[#e8e6e3]/15">
            © 2026 WIZARD DYNAMICS — MUNICH
          </span>
          <div className="flex gap-8 font-mono text-xs text-[#e8e6e3]/15">
            <Link
              href="https://apps.wizarddynamics.com"
              className="hover:text-[#e8e6e3]/40 transition-colors"
            >
              APPS
            </Link>
            <a
              href="https://apps.apple.com/at/developer/manuel-worlitzer/id1785527240"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#e8e6e3]/40 transition-colors"
            >
              APP STORE
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
