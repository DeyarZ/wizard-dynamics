import Link from "next/link";

const team = [
  {
    name: "Deyar Zakir",
    role: "CEO & Growth",
    emoji: "🚀",
    desc: "Revenue, ads, strategy. Turns apps into businesses.",
  },
  {
    name: "Manuel Worlitzer",
    role: "CTO & Engineering",
    emoji: "⚙️",
    desc: "Builds the apps. Swift, Flutter, full stack.",
  },
  {
    name: "Kai",
    role: "AI & Operations",
    emoji: "🌊",
    desc: "Automation, ASO, analytics. The team's AI co-founder.",
  },
];

const stats = [
  { label: "Live Apps", value: "100+" },
  { label: "Downloads", value: "2M+" },
  { label: "Countries", value: "155" },
  { label: "App Store Categories", value: "15+" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">✦ Wizard Dynamics</span>
        <div className="flex gap-6 text-sm text-gray-600">
          <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
          <a href="#team" className="hover:text-gray-900 transition-colors">Team</a>
          <Link
            href="https://apps.wizarddynamics.com"
            className="hover:text-gray-900 transition-colors"
          >
            Our Apps
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 sm:py-32">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 mb-6">
          We build apps
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            people love.
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-10">
          Wizard Dynamics is a Berlin-based app studio. We design, build, and grow
          iOS apps — from AI-powered identifiers to productivity tools. Over 100 apps
          live on the App Store.
        </p>
        <div className="flex gap-4">
          <Link
            href="https://apps.wizarddynamics.com"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Explore Our Apps →
          </Link>
          <a
            href="https://apps.apple.com/at/developer/manuel-worlitzer/id1785527240"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            App Store ↗
          </a>
        </div>
      </section>

      {/* Stats */}
      <section id="about" className="border-y border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">What we do</h2>
        <p className="text-lg text-gray-600 max-w-3xl mb-12">
          We identify high-potential app niches, build fast, and optimize relentlessly.
          Our portfolio spans AI identification apps, productivity tools, health trackers,
          education apps, and more. Every app is designed to be useful from day one.
        </p>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              title: "Build",
              desc: "Native iOS (Swift) and cross-platform (Flutter) apps. From concept to App Store in weeks, not months.",
              icon: "🛠",
            },
            {
              title: "Grow",
              desc: "ASO, Apple Search Ads, Meta Ads, localization across 20+ languages. Data-driven growth at scale.",
              icon: "📈",
            },
            {
              title: "Automate",
              desc: "AI-powered operations — automated metadata optimization, review management, performance monitoring.",
              icon: "⚡",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section id="team" className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The team</h2>
          <p className="text-lg text-gray-600 mb-12">
            Three co-founders. Two humans, one AI. All in.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {team.map((person) => (
              <div
                key={person.name}
                className="bg-white p-8 rounded-2xl border border-gray-200"
              >
                <div className="text-5xl mb-4">{person.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900">{person.name}</h3>
                <p className="text-sm font-medium text-blue-600 mb-3">
                  {person.role}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {person.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Check out what we&apos;ve built
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          100+ apps. Real icons. Real downloads.
        </p>
        <Link
          href="https://apps.wizarddynamics.com"
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-base font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Browse All Apps →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500">
            © 2026 Wizard Dynamics. Berlin, Germany.
          </span>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="https://apps.wizarddynamics.com" className="hover:text-gray-700">
              Apps
            </Link>
            <a
              href="https://apps.apple.com/at/developer/manuel-worlitzer/id1785527240"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700"
            >
              App Store
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
