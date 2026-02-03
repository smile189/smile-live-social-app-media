'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} className="relative">
        
        {/* 🤖 Cyber-Smile Loader (Centrat, Minimalist, Wow) */}
        <div className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-none">
          <div className="relative flex flex-col items-center gap-4">
            
            {/* 👀 Ochii (The Eyes) */}
            <div className="flex gap-12">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1, 0], 
                    opacity: [0, 1, 1, 0] 
                  }}
                  transition={{ 
                    duration: 1.4, 
                    times: [0, 0.2, 0.8, 1],
                    delay: i * 0.1,
                    ease: "circOut"
                  }}
                  className="w-2.5 h-2.5 bg-[#FFD700] rounded-full shadow-[0_0_15px_#FFD700]"
                />
              ))}
            </div>

            {/* 👄 Gura (The Smile) */}
            <svg width="200" height="40" viewBox="0 0 200 40" fill="none">
              <motion.path
                d="M40 10C70 25 130 25 160 10"
                stroke="#FFD700"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1], 
                  opacity: [0, 1, 0] 
                }}
                transition={{ 
                  duration: 1.4, 
                  times: [0.1, 0.6, 1],
                  ease: "easeInOut" 
                }}
                className="drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              />
            </svg>
          </div>
        </div>

        {/* 🎞️ Tranziția Pagină (Ultra Clean) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
}
