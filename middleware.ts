// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const country = req.geo?.country || 'RO'; // 'RO' forțat pentru test local
  const BLOCKED = ['RO', 'RU', 'KP']; // Țările blocate

  const { pathname } = req.nextUrl;

  // Dacă utilizatorul e blocat, verificăm ce rută accesează
  if (BLOCKED.includes(country)) {
    // 1. Permitem accesul la pagina /blocked ca să nu facem loop
    if (pathname.startsWith('/blocked')) return NextResponse.next();

    // 2. Aplicăm blocarea pe toate componentele tale:
    const isProtected = 
      pathname === '/' ||                // Landing
      pathname.startsWith('/app') ||      // App-ul tău principal
      pathname.startsWith('/dashboard');  // Dashboard-ul

    if (isProtected) {
      // Trimite-i pe toți la aceeași pagină de eroare
      return NextResponse.rewrite(new URL('/blocked', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher-ul asigură că middleware-ul verifică tot ce mi-ai zis
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
