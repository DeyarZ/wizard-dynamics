export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-sans px-6 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4">Wizard Dynamics</h1>
        <p className="text-xl text-gray-300 max-w-xl mx-auto">
          We build bold, high-impact software that cuts through the noise and scales fast.
        </p>
      </section>

      {/* Products Section */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "Daimonion", desc: "Your brutal anti-procrastination AI coach" },
          { name: "ShopPulse", desc: "AI-driven pricing optimizer for Shopify stores" },
          { name: "Cookli", desc: "Create recipes with what you already have" },
          { name: "Coffely", desc: "Track your coffee. Level up your day." },
          { name: "YOUnique", desc: "Beauty AI that generates your perfect look" },
        ].map((app) => (
          <div key={app.name} className="bg-zinc-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-bold mb-2">{app.name}</h2>
            <p className="text-gray-400">{app.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center mt-20 border-t border-gray-800 pt-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Wizard Dynamics – Contact: <a className="underline" href="mailto:deyar@wizarddynamics.com">deyar@wizarddynamics.com</a>
      </footer>
    </main>
  );
}
