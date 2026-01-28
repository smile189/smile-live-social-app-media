import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0b0b0b] border-t border-yellow-600/20">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">

        {/* Brand */}
        <div className="text-center md:text-left">
          <h2 className="text-yellow-500 tracking-widest text-xl font-semibold">
            smile live 
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Connect. Share. Grow.
          </p>
        </div>

        {/* Links */}
        <nav className="flex gap-6 text-sm">
          {["About", "Careers", "Privacy", "Terms"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-gray-300 hover:text-yellow-500 transition relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-500 hover:after:w-full after:transition-all"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Social */}
        <div className="flex gap-4">
          {["IG", "X", "IN"].map((social) => (
            <Link
              key={social}
              href="#"
              className="text-gray-300 border border-yellow-600/40 px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-500 hover:text-black transition"
            >
              {social}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center text-xs text-gray-500 py-4 border-t border-white/5">
        © {new Date().getFullYear()} smile live . All rights reserved.
      </div>
    </footer>
  );
}
