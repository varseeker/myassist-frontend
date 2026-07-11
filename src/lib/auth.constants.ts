export const REFRESH_TOKEN_COOKIE = 'myassist_refresh_token';

export const AUTH_ROUTES = {
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
} as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/tickets',
  '/users',
  '/notifications',
  '/projects',
] as const;
