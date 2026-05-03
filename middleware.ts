import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Inițializăm răspunsul și clientul Supabase pentru managementul sesiunii
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Această linie este CRITICĂ: reîmprospătează sesiunea dacă e expirată
  await supabase.auth.getUser()

  // 2. Logica de Geo-Blocking
  const { pathname } = request.nextUrl
  const isProtected = pathname.startsWith('/app') || pathname.startsWith('/dashboard')
  
  // Pe Vercel/Producție folosim request.geo. Pe local va fi 'US' default
  const country = (request as any).geo?.country || 'RO' 
  
  const BLOCKED = ['RU', 'KP', 'VE', 'CU', 'BR', 'CO', 'CN', 'IR', 'SY', 'VN', 'IN']

  if (isProtected && BLOCKED.includes(country)) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Protocol Security | Smile Live</title>
          <script src="https://tailwindcss.com"></script>
          <style>
              @import url('https://googleapis.com');
              body { background-color: #000; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; overflow: hidden; }
              .bg-architecture {
                  background-image: linear-gradient(rgba(250, 204, 21, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250, 204, 21, 0.03) 1px, transparent 1px);
                  background-size: 60px 60px;
              }
              .accent-line { width: 1px; background: linear-gradient(180deg, transparent, #facc15, transparent); height: 100vh; position: fixed; top: 0; left: 50px; opacity: 0.2; }
              .text-huge { font-size: clamp(3rem, 12vw, 10rem); line-height: 0.9; letter-spacing: -0.04em; }
              .vertical-text { writing-mode: vertical-rl; text-orientation: mixed; }
              .reveal { animation: revealText 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
              @keyframes revealText { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          </style>
      </head>
      <body class="min-h-screen bg-architecture flex flex-col relative">
          <div class="accent-line"></div>
          <nav class="w-full p-8 flex justify-between items-center z-50">
              <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full border border-yellow-400/30 bg-zinc-900"></div>
                  <span class="text-[9px] font-bold tracking-[0.6em] text-yellow-400 uppercase">SMILE LIVE</span>
              </div>
          </nav>
          <main class="flex-1 flex flex-col justify-center px-12 md:px-32 relative z-10">
              <div class="reveal">
                  <p class="text-yellow-400 text-[10px] font-bold tracking-[0.8em] uppercase mb-6">Access Restriction Protocol</p>
                  <h1 class="text-huge font-extrabold mb-12">
                      <span class="block">REGION</span>
                      <span class="block italic text-zinc-900" style="-webkit-text-stroke: 1px rgba(255,255,255,0.2);">LOCKED</span>
                  </h1>
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                      <div class="lg:col-span-6 border-l-2 border-yellow-400 pl-8">
                          <p class="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-4 font-bold">Inquiry Reference: ${country}</p>
                          <p class="text-zinc-300 text-lg font-light">Service deployment is suspended for this node (${country}).</p>
                      </div>
                      <div class="lg:col-span-6 flex flex-col gap-8 lg:items-end">
                          <a href="/" class="px-12 py-5 bg-white text-black font-bold text-[10px] uppercase tracking-[0.6em] hover:bg-yellow-400 transition-all">Return to Base</a>
                      </div>
                  </div>
              </div>
          </main>
          <footer class="p-8 flex justify-between items-center text-[8px] text-zinc-700 tracking-[0.4em] uppercase">
              <span>Node_Loc: ${country}</span>
              <span>© 2026 Smile Live App</span>
          </footer>
      </body>
      </html>`,
      { status: 451, headers: { 'content-type': 'text/html' } }
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
