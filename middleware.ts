// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const country = (req as any).geo?.country || 'RO'; 
  const BLOCKED = ['RO', 'RU', 'KP'];

  if (BLOCKED.includes(country)) {
    // În loc de rewrite (care caută un fișier), trimitem un răspuns HTML direct
    return new NextResponse(
      `<html><body style="background:black;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
        <div style="text-align:center;border:1px solid #333;padding:50px;border-radius:20px;">
          <h1 style="color:#facc15;">SMILE LIVE APP</h1>
          <p>Access denied for region: ${country}</p>
        </div>
      </body></html>`,
      { status: 451, headers: { 'content-type': 'text/html' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
