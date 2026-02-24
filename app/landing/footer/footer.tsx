"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  ArrowUpRight,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [region, setRegion] = useState("Locating...");

  useEffect(() => {
    const timer = setTimeout(() => setRegion("Bucharest, Romania"), 1000);
    return () => clearTimeout(timer);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <footer className="relative bg-[#F4F4F6] text-[#0A0A0A] pt-28 pb-16 px-6 border-t border-zinc-200 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* TOP SECTION */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-24">

          {/* BRAND */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
          >
            <h2 className="text-6xl md:text-5xl font-black tracking-tight leading-none">
              SMILE LIVE<span className="text-zinc-400">™</span>
            </h2>

            <p className="mt-6 text-zinc-500 max-w-md leading-relaxed">
              The next generation social platform where creators,
              brands and communities build meaningful digital presence.
            </p>


          </motion.div>

          {/* REGION BADGE */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex items-start lg:items-end"
          >
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-zinc-200 shadow-sm text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <MapPin size={16} className="text-zinc-400" />
              <span className="text-zinc-600">{region}</span>
            </div>
          </motion.div>
        </div>

        {/* LINK GRID */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-16 py-20 border-y border-zinc-200"
        >
          {[
            {
              title: "Creators",
              links: ["Go LIVE", "Monetization", "Creator Tools", "Analytics"],
            },
            {
              title: "Brands",
              links: ["Advertise", "Partnerships", "Campaign Manager"],
            },
            {
              title: "Platform",
              links: ["About Us", "Careers", "Press", "Developers"],
            },
            {
              title: "Legal",
              links: ["Privacy Policy", "Terms of Service", "Security"],
            },
          ].map((section, i) => (
            <motion.div key={i} variants={item} className="space-y-8">
              <h4 className="text-[11px] uppercase tracking-[0.4em] text-zinc-400 font-bold">
                {section.title}
              </h4>

              <nav className="flex flex-col gap-5">
                {section.links.map((link) => (
                  <Link
                    key={link}
                    href="/"
                    className="group flex items-center gap-2 text-lg font-medium text-zinc-700 hover:text-black transition-all duration-300"
                  >
                    <span className="relative">
                      {link}
                      <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
                    </span>

                    <ArrowUpRight
                      size={16}
                      className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                    />
                  </Link>
                ))}
              </nav>
            </motion.div>
          ))}
        </motion.div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-6 text-[11px] uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-6">
            <span>© {currentYear} Smile Live</span>
            <span className="hidden md:block w-8 h-[1px] bg-zinc-300"></span>
            <span>All Rights Reserved</span>
          </div>

          <div className="text-zinc-400">
            Building the future of social interaction.
          </div>
        </div>
      </div>

      {/* SUBTLE BACKGROUND TEXT */}
      <div className="absolute -bottom-16 -left-10 text-[18vw] font-black text-black opacity-[0.02] pointer-events-none select-none">
        LIVE
      </div>
    </footer>
  );
}