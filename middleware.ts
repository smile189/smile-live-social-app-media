import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // TypeScript nu vede .geo pe NextRequest, așa că forțăm tipul 'any'
  const requestWithGeo = req as any;
  
  // Extragem țara. Pe Vercel va fi populat, local va fi 'RO'
  const country = requestWithGeo.geo?.country || 'RO';

  const BLOCKED = ['RO', 'RU', 'KP'];
  const { pathname } = req.nextUrl;

  // Verificăm dacă ruta curentă este /blocked ca să nu facem buclă infinită
  if (pathname.startsWith('/blocked')) {
    return NextResponse.next();
  }

  if (BLOCKED.includes(country)) {
    // Îi arătăm conținutul din app/blocked/page.tsx
    return NextResponse.rewrite(new URL('/blocked', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
