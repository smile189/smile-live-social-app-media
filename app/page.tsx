import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-yellow-100 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-white py-32 px-16 sm:items-start rounded-3xl shadow-xl">
        
        {/* Logo */}
        <Image
          src="/logo.svg"
          alt="SocialApp logo"
          width={48}
          height={48}
          priority
        />

        {/* Hero text */}
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-bold leading-10 tracking-tight text-gray-900">
            Hello Alexandra 👋
          </h1>

          <p className="max-w-md text-lg leading-8 text-gray-600">
            Bine ai venit pe <span className="font-semibold text-yellow-500">smile live app</span> —  
            locul unde ideile, prietenii și conversațiile prind viață.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <button
            className="flex h-12 w-full items-center justify-center rounded-full bg-yellow-400 px-6 text-black transition hover:bg-yellow-500 md:w-[158px]"
          >
            Începe acum
          </button>

          <button
            className="flex h-12 w-full items-center justify-center rounded-full border border-yellow-400 px-6 text-yellow-500 transition hover:bg-yellow-50 md:w-[158px]"
          >
            Află mai mult
          </button>
        </div>

      </main>
    </div>
  );
}
