import axios from 'axios';
import { useAuthStore } from '@/features/auth/store';
import { redirectToLogin } from '@/lib/auth.utils';
import { API_BASE_URL } from './constants';
import type { ApiResponse } from '@/types';
import type { AuthTokens } from '@/features/auth/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

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

async function refreshAccessToken() {
  const { data } = await axios.post<ApiResponse<AuthTokens>>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return data.data;
}

apiClient.interceptors.request.use((config) => {
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
      return Promise.reject(error);
    }

    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      const data = error.response?.data as
        | { message?: string; errors?: string[] }
        | undefined;
      const message =
        data?.errors?.length
          ? data.errors.join(', ')
          : (data?.message ?? error.message);
      return Promise.reject(new Error(message));
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearSession();
      redirectToLogin({ sessionExpired: true });
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
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
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
