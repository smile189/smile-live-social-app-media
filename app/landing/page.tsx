"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "./header/header";
import Footer from "./footer/footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center font-sans overflow-hidden bg-black">
      <Header />
      {/* Background Video cu Overlay Gradient */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>

      {/* Main Content Card */}
      <main className="relative z-10 flex flex-col items-center px-6 text-center max-w-4xl">
        
        {/* Badge Under Construction */}
        <div className="mb-6 px-4 py-1 border border-yellow-400/50 bg-yellow-400/10 backdrop-blur-md rounded-full animate-pulse">
          <span className="text-yellow-400 text-sm font-semibold tracking-widest uppercase">
            🚧 Under Construction
          </span>
        </div>

        {/* Logo Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-yellow-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <Image 
            src="/logosmile.jpeg" 
            alt="Smile Live Logo" 
            width={120} 
            height={120} 
            className="relative mb-6 drop-shadow-2xl sm:w-32 sm:h-32 w-24 h-24"
          />
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter mb-4">
          SMILE <span className="text-yellow-400">LIVE-social media app</span>
        </h1>

        <p className="text-lg sm:text-2xl text-gray-200 max-w-2xl leading-relaxed mb-10 font-light">
          Redefining connection. Experience <span className="font-semibold text-white">4K live feeds</span> and interactive social moments. 
          The future is almost here. 🚀
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/smile_social"
            className="px-10 py-4 bg-yellow-400 text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-yellow-400/60 hover:-translate-y-1 transition-all active:scale-95"
          >
            Enter Smile Social 🌟
          </Link>
          
          <button className="px-10 py-4 bg-white/10 backdrop-blur-lg text-white border border-white/20 font-bold text-lg rounded-xl hover:bg-white/20 transition-all">
            Notify Me
          </button>
        </div>
      </main>

      {/* Floating Elements (Decorative) */}
      <div className="absolute top-20 left-[10%] animate-bounce hidden sm:block">
        <div className="w-12 h-12 rounded-full bg-yellow-400/20 backdrop-blur-xl flex items-center justify-center text-2xl">✨</div>
      </div>
      <div className="absolute bottom-20 right-[10%] animate-pulse hidden sm:block">
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-3xl">💛</div>
      </div>
  <Footer />



      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
