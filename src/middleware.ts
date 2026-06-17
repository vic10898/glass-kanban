import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard and board routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/boards')) {
    if (!token) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If already logged in, redirect away from auth page (/) to dashboard
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/boards/:path*'],
};
