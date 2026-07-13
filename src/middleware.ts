import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_ROUTES,
  REFRESH_TOKEN_COOKIE,
} from '@/lib/auth.constants';
import { isAuthPath, isProtectedPath } from '@/lib/auth.utils';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isProtectedRoute = isProtectedPath(pathname);
  const isAuthRoute = isAuthPath(pathname);

  if (isProtectedRoute && !refreshToken) {
    const loginUrl = new URL(AUTH_ROUTES.login, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
    '/ticket-management/:path*',
    '/users/:path*',
    '/notifications/:path*',
    '/projects/:path*',
    '/project-members/:path*',
    '/messaging/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
