import axios from 'axios';
import { useAuthStore } from '@/features/auth/store';
import { redirectToLogin } from '@/lib/auth.utils';
import { API_BASE_URL } from './constants';
import type { ApiResponse } from '@/types';
import type { AuthTokens } from '@/features/auth/api';

/** Auth routes that must never trigger bearer attach or silent refresh. */
const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const;

const REQUEST_TIMEOUT_MS = 20_000;
const REFRESH_TIMEOUT_MS = 15_000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function isAuthPublicRequest(url?: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const path = url.startsWith('http')
      ? new URL(url).pathname
      : url.split('?')[0] ?? url;
    return AUTH_PUBLIC_PATHS.some(
      (authPath) => path === authPath || path.endsWith(authPath),
    );
  } catch {
    return AUTH_PUBLIC_PATHS.some((authPath) => url.includes(authPath));
  }
}

function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach((promise) => {
    if (error || !token) {
      promise.reject(error);
      return;
    }
    promise.resolve(token);
  });
  refreshQueue = [];
}

function resetRefreshState() {
  isRefreshing = false;
}

function toErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Request failed';
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Check your connection and try again.';
  }

  if (!error.response) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  const data = error.response.data as
    | { message?: string; errors?: string[] }
    | undefined;

  if (data?.errors?.length) {
    return data.errors.join(', ');
  }

  return data?.message ?? error.message;
}

async function refreshAccessToken() {
  const { data } = await axios.post<ApiResponse<AuthTokens>>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true, timeout: REFRESH_TIMEOUT_MS },
  );
  return data.data;
}

apiClient.interceptors.request.use((config) => {
  // Never send a stale access token on public auth endpoints.
  if (isAuthPublicRequest(config.url)) {
    if (config.headers) {
      delete config.headers.Authorization;
    }
    return config;
  }

  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(new Error(toErrorMessage(error)));
    }

    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const isPublicAuth = isAuthPublicRequest(originalRequest.url);

    // Wrong credentials / public auth failures must NOT attempt token refresh.
    if (status !== 401 || originalRequest._retry || isPublicAuth) {
      return Promise.reject(new Error(toErrorMessage(error)));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject: (queueError) => {
            reject(
              queueError instanceof Error
                ? queueError
                : new Error(toErrorMessage(queueError)),
            );
          },
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const result = await refreshAccessToken();
      useAuthStore.getState().setSession(result.accessToken, result.user);
      processQueue(null, result.accessToken);
      originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearSession();
      redirectToLogin({ sessionExpired: true });
      return Promise.reject(new Error(toErrorMessage(refreshError)));
    } finally {
      resetRefreshState();
    }
  },
);
