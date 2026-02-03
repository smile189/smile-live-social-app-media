'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} className="relative min-h-screen overflow-hidden">
        
        {/* 🟡 Biluța 1: Ambient Glow - Se mișcă lent, organic */}
        <motion.div
          initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: '0%', y: '0%' }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="fixed top-1/4 left-1/4 w-[300px] h-[300px] bg-[#FFD700]/20 rounded-full blur-[100px] z-0 pointer-events-none"
        />

        {/* ⚪ Biluța 2: Accent Glow - O urmează pe prima */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 1 }}
          className="fixed bottom-1/4 right-1/4 w-[250px] h-[250px] bg-white/10 rounded-full blur-[80px] z-0 pointer-events-none"
        />

        {/* Pagina propriu-zisă: Tranziție tip "Liquid Fade" */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1] // Cubic Bezier ultra-fluid
          }}
          className="relative z-10"
        >
          {children}
        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
}
