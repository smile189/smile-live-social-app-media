"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navItems = ["Feed", "Explore", "Messages", "Profile"];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#0b0b0b] border-b border-yellow-600/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-yellow-500 font-semibold tracking-widest text-lg">
          SMILE 
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 text-sm">
          {navItems.map((item) => (
            <Link
              key={item}
              href="#"
              className="text-gray-300 hover:text-yellow-500 transition relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-500 hover:after:w-full after:transition-all"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-gray-300 hover:text-yellow-500 transition">
            Sign in
          </button>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-400 transition">
            Get Started
          </button>
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden text-gray-300 hover:text-yellow-500 transition"
        >
          ☰
        </button>
      </div>

      {/* Animated mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#0b0b0b] border-l border-yellow-600/20 z-50 p-6 flex flex-col"
            >
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="self-end text-gray-300 hover:text-yellow-500 text-2xl mb-10"
              >
                ✕
              </button>

              {/* Links */}
              <motion.nav
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
                className="flex flex-col gap-6 text-xl"
              >
                {navItems.map((item) => (
                  <motion.div
                    key={item}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href="#"
                      onClick={() => setOpen(false)}
                      className="text-gray-200 hover:text-yellow-500 transition"
                    >
                      {item}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-4">
                <button className="text-gray-300 hover:text-yellow-500 transition text-left">
                  Sign in
                </button>
                <button className="bg-yellow-500 text-black px-4 py-3 rounded-md font-medium hover:bg-yellow-400 transition">
                  Get Started
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
