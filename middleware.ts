/**
 * middleware.ts - Middleware for region-based access control in Smile Live App
 * This middleware checks the geographic location of incoming requests to protected routes (e.g., /app, /dashboard) and blocks 
 * access from high-risk countries based on a predefined blacklist.
 * authored by BM, inspired by Alexandra Storyteller's vision for a secure and compliant platform that respects global regulatory landscapes while prioritizing user safety.
 * copyright 2026 Smile Live App. All rights reserved.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = pathname.startsWith('/app') || pathname.startsWith('/dashboard');

  if (!isProtected) return NextResponse.next();


  const country = (req as any).geo?.country || 'US'; 
// black list of high-risk countries based on geopolitical and security considerations (e.g., Russia, North Korea, Venezuela, Cuba, China, Iran, Syria, Vietnam, India)
  const BLOCKED = [ 
    'RU', 'KP', // 
    
    // AMERICA LATINĂ (Zone cu risc ridicat sau restricții comerciale)
    'VE', // Venezuela
    'CU', // Cuba
    'BR', // Brazilia
    'CO', // Columbia
    
    // ASIA (Zone cu restricții de securitate sau reglementări stricte)
    'CN', // China
    'IR', // Iran
    'SY', // Siria
    'VN', // Vietnam
    'IN'  // India (opțional, dacă ai probleme cu bot-trafic)
  ];

  if (BLOCKED.includes(country)) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Protocol Security | Smile Live</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
              @import url('https://fonts.googleapis.com');
              
              body { 
                  background-color: #000; 
                  color: #fff; 
                  font-family: 'Plus Jakarta Sans', sans-serif;
                  margin: 0;
                  overflow: hidden;
                  -webkit-font-smoothing: antialiased;
              }

              /* GRIDUL TEHNIC DE FUNDAL */
              .bg-architecture {
                  background-image: 
                    linear-gradient(rgba(250, 204, 21, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(250, 204, 21, 0.03) 1px, transparent 1px);
                  background-size: 60px 60px;
                  background-position: center center;
              }

              /* LINIA GALBENA DINAMICA */
              .accent-line {
                  width: 1px;
                  background: linear-gradient(180deg, transparent, #facc15, transparent);
                  height: 100vh;
                  position: fixed;
                  top: 0;
                  left: 50px;
                  opacity: 0.2;
              }

              .text-huge {
                  font-size: clamp(3rem, 12vw, 10rem);
                  line-height: 0.9;
                  letter-spacing: -0.04em;
              }

              .vertical-text {
                  writing-mode: vertical-rl;
                  text-orientation: mixed;
              }

              /* ANIMATIE INTRARE */
              .reveal {
                  animation: revealText 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
              }

              @keyframes revealText {
                  from { transform: translateY(100px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
              }
          </style>
      </head>
      <body class="min-h-screen bg-architecture flex flex-col relative">
          
          <!-- ACCENT LINES -->
          <div class="accent-line"></div>
          <div class="accent-line" style="left: auto; right: 50px; opacity: 0.1;"></div>

          <!-- TOP BAR -->
          <nav class="w-full p-8 flex justify-between items-center z-50">
              <div class="flex items-center gap-4">
                  <img src="/logosmile.jpeg" alt="Logo" class="w-10 h-10 rounded-full border border-yellow-400/30 object-cover" />
                  <span class="font-['Syncopate'] text-[9px] font-bold tracking-[0.6em] text-yellow-400">SMILE LIVE</span>
              </div>
              <div class="text-[8px] tracking-[0.4em] text-zinc-600 font-bold uppercase">
                  Shield Protocol // Active
              </div>
          </nav>

          <!-- MAIN ARCHITECTURE -->
          <main class="flex-1 flex flex-col justify-center px-12 md:px-32 relative z-10">
              <div class="reveal">
                  <p class="text-yellow-400 text-[10px] font-bold tracking-[0.8em] uppercase mb-6">
                      Access Restriction Protocol
                  </p>
                  
                  <h1 class="text-huge font-extrabold mb-12">
                      <span class="block">REGION</span>
                      <span class="block italic text-zinc-900" style="-webkit-text-stroke: 1px rgba(255,255,255,0.2);">LOCKED</span>
                  </h1>

                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                      <div class="lg:col-span-6 border-l-2 border-yellow-400 pl-8">
                          <p class="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-4 font-bold">Inquiry Reference: ${country}</p>
                          <p class="text-zinc-300 text-lg font-light leading-relaxed">
                              This terminal has identified your point of origin as a restricted territory. 
                              Service deployment is suspended for this node.
                          </p>
                      </div>
                      
                      <div class="lg:col-span-6 flex flex-col gap-8 lg:items-end">
                          <a href="mailto:support@smileliveapp.com" class="text-[11px] text-white hover:text-yellow-400 transition-all uppercase tracking-[0.5em] border-b border-white/10 pb-2">
                              support@smileliveapp.com
                          </a>
                          <a href="/" class="px-12 py-5 bg-white text-black font-bold text-[10px] uppercase tracking-[0.6em] hover:bg-yellow-400 transition-all">
                              Return to Base
                          </a>
                      </div>
                  </div>
              </div>
          </main>

          <!-- SIDE DECOR -->
          <div class="fixed right-4 top-1/2 -translate-y-1/2 vertical-text text-[8px] text-zinc-800 tracking-[1em] uppercase font-bold hidden md:block">
              Smile Live Ecosystem // Security Layer
          </div>

          <!-- FOOTER -->
          <footer class="p-8 flex justify-between items-center text-[8px] text-zinc-700 tracking-[0.4em] uppercase">
              <span>Node_Loc: ${country}</span>
              <span class="italic text-zinc-500">© 2026 Smile Live App</span>
          </footer>

      </body>
      </html>`,
      { status: 451, headers: { 'content-type': 'text/html' } }
    );
  }

  return NextResponse.next();
}
export const config = {
  matcher: ['/app/:path*', '/dashboard/:path*'],
};
