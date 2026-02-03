'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Folosim un state pentru a ne asigura că randarea este stabilă pe client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!mounted) return <div className="opacity-0">{children}</div>;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} className="relative w-full">
        
        {/* 🤖 Cyber-Smile Loader */}
        <div className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-none">
          <div className="relative flex flex-col items-center gap-2">
            
            {/* 👀 Ochii - Fixați fără map dinamic care să inducă erori de hooks */}
            <div className="flex gap-16 mb-2">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.3, 1, 1, 1, 0], 
                  scaleY: [0, 1.3, 1, 0.1, 1, 0], 
                  opacity: [0, 1, 1, 1, 1, 0] 
                }}
                transition={{ duration: 1.2, times: [0, 0.2, 0.3, 0.6, 0.7, 1] }}
                className="w-3.5 h-3.5 bg-[#FFD700] rounded-full shadow-[0_0_20px_#FFD700]"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.3, 1, 1, 1, 0], 
                  scaleY: [0, 1.3, 1, 0.1, 1, 0], 
                  opacity: [0, 1, 1, 1, 1, 0] 
                }}
                transition={{ duration: 1.2, times: [0, 0.2, 0.3, 0.6, 0.7, 1], delay: 0.05 }}
                className="w-3.5 h-3.5 bg-[#FFD700] rounded-full shadow-[0_0_20px_#FFD700]"
              />
            </div>

            {/* 👄 Gura (Smile) */}
            <svg width="220" height="50" viewBox="0 0 220 50" fill="none" className="overflow-visible">
              <motion.path
                d="M40 15C80 35 140 35 180 15"
                stroke="#FFD700"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, times: [0.1, 0.5, 0.8, 1] }}
                className="drop-shadow-[0_0_15px_rgba(255,214,0,0.6)]"
              />
            </svg>
          </div>
        </div>

        {/* 🎞️ Content Transition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
}
