export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My App</h1>
        <nav className="flex gap-4">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to My App
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          Your app is live and ready to go. Start building something amazing.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            Get Started
          </button>
          <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Learn More
          </button>
        </div>
      </main>

      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Fast", desc: "Built with Vite for lightning-fast development and production builds." },
          { title: "Modern", desc: "Uses React 18, TypeScript, and Tailwind CSS for a great developer experience." },
          { title: "Ready", desc: "Packed with UI components and ready to deploy with one click." },
        ].map((card) => (
          <div key={card.title} className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
