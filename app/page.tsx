import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-yellow-50 font-sans">
      <main className="flex flex-col w-full max-w-5xl bg-white rounded-3xl shadow-xl p-12 sm:p-16 space-y-12">

        {/* Logo */}
        <div className="flex items-center justify-center sm:justify-start mb-6">
          <Image
            src="/logo.svg"
            alt="Smile Live logo"
            width={64}
            height={64}
            priority
          />
        </div>

        {/* Hero Section */}
        <section className="flex flex-col items-center sm:items-start text-center sm:text-left gap-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            😊 Smile Live — The Future of Connection
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl max-w-3xl leading-relaxed">
            Welcome to <span className="font-semibold text-yellow-500">Smile Live App</span> —  
            a next-generation social ecosystem built to foster authentic human connections 
            with real-time engagement and AI-driven positivity. Focused on user well-being, 
            data sovereignty, and immersive live experiences. 👥
          </p>
        </section>

        {/* Key Features */}
        <section className="grid sm:grid-cols-2 gap-8">
          <div className="bg-yellow-100 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Immersive Live Streaming</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              4K HDR broadcasting with AR filters reacting to the streamer’s emotions in real-time.
            </p>
          </div>

          <div className="bg-yellow-100 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Smile AI Moderator</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Proprietary AI filters toxic behavior, ensuring a safe & positive "Smile Zone".
            </p>
          </div>

          <div className="bg-yellow-100 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Smart Communities</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Dynamic micro-communities called "Vibes", based on shared values & activities.
            </p>
          </div>

          <div className="bg-yellow-100 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Decentralized Identity</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Web3 identity protocols allow users to own their data and migrate across the decentralized web.
            </p>
          </div>
        </section>



        {/* CTA Buttons */}
        <section className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
          <button className="flex h-12 items-center justify-center rounded-full bg-yellow-400 px-6 text-black font-semibold transition hover:bg-yellow-500">
            Începe acum
          </button>
          <button className="flex h-12 items-center justify-center rounded-full border border-yellow-400 px-6 text-yellow-500 font-semibold transition hover:bg-yellow-50">
            Află mai mult
          </button>
        </section>

      </main>
    </div>
  );
}
