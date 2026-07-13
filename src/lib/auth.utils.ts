import { AUTH_ROUTES, PROTECTED_ROUTES } from '@/lib/auth.constants';

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return (
    pathname === AUTH_ROUTES.login ||
    pathname === AUTH_ROUTES.register ||
    pathname === AUTH_ROUTES.forgotPassword ||
    pathname === AUTH_ROUTES.resetPassword
  );
}

export function getSafeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return AUTH_ROUTES.dashboard;
  }

  if (isAuthPath(path.split('?')[0] ?? path)) {
    return AUTH_ROUTES.dashboard;
  }

  return path;
}

export function redirectToLogin(options?: {
  redirect?: string;
  sessionExpired?: boolean;
}) {
  if (typeof window === 'undefined') {
    return;
  }

  if (isAuthPath(window.location.pathname)) {
    return;
  }

  const loginUrl = new URL(AUTH_ROUTES.login, window.location.origin);
  const redirect =
    options?.redirect ??
    `${window.location.pathname}${window.location.search}`;

  if (redirect && !isAuthPath(redirect.split('?')[0] ?? redirect)) {
    loginUrl.searchParams.set('redirect', redirect);
  }

  if (options?.sessionExpired) {
    loginUrl.searchParams.set('sessionExpired', '1');
  }

  if (loginUrl.toString() === window.location.href) {
    return;
  }

  window.location.replace(loginUrl.toString());
}
