import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that do not require authentication
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isApiAuth = pathname.startsWith('/api/auth');
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico';

  if (isStatic || isApiAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  // If user is not authenticated and trying to access a protected page
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to visit login or register
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
