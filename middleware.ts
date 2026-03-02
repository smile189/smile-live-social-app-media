import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Evităm loop-ul de redirecționare
  if (pathname === '/blocked') return NextResponse.next();

  const isProtected = pathname.startsWith('/app') || pathname.startsWith('/dashboard');
  if (!isProtected) return NextResponse.next();

  // Verificăm țara (Vercel adaugă acest header automat)
  const country = req.headers.get('x-vercel-ip-country') || 'US';

  const BLOCKED = ['RU', 'KP', 'VE', 'CU', 'BR', 'CO', 'CN', 'IR', 'SY', 'VN', 'IN'];

  if (BLOCKED.includes(country)) {
    // Redirecționăm către pagina creată de tine, nu injectăm HTML-ul aici!
    const url = req.nextUrl.clone();
    url.pathname = '/blocked';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/dashboard/:path*'],
};
