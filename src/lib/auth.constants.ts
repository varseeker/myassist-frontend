export const REFRESH_TOKEN_COOKIE = 'myassist_refresh_token';

export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
} as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/tickets',
  '/ticket-management',
  '/users',
  '/notifications',
  '/projects',
  '/project-members',
  '/messaging',
  '/profile',
] as const;
