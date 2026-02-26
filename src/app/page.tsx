import apps from "@/data/apps.json";
import Image from "next/image";

// Group apps by genre
const grouped: Record<string, typeof apps> = {};
for (const app of apps) {
  const genre = app.genre || "Other";
  if (!grouped[genre]) grouped[genre] = [];
  grouped[genre].push(app);
}

// Sort categories by count descending
const categories = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <header className="py-20 px-6 text-center border-b border-gray-100">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Wizard Dynamics
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-xl mx-auto">
          103 apps. Millions of users.
        </p>
      </header>

      {/* App Grid by Category */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {categories.map(([genre, genreApps]) => (
          <section key={genre}>
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-100 pb-2">
              {genre}{" "}
              <span className="text-base font-normal text-gray-400">
                ({genreApps.length})
              </span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
              {genreApps.map((app) => (
                <a
                  key={app.id}
                  href={`https://apps.apple.com/app/id${app.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {app.icon ? (
                    <Image
                      src={app.icon}
                      alt={app.name}
                      width={100}
                      height={100}
                      className="rounded-[22%] shadow-sm"
                      unoptimized
                    />
                  ) : (
                    <div className="w-[100px] h-[100px] rounded-[22%] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      No icon
                    </div>
                  )}
                  <span className="text-xs text-gray-600 leading-tight line-clamp-2 max-w-[100px]">
                    {app.name}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Wizard Dynamics. All rights reserved.
      </footer>
    </div>
  );
}
