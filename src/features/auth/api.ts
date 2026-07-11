import { apiClient } from '@/lib/api';
import type { ApiResponse, User } from '@/types';

export interface AuthTokens {
  accessToken: string;
  user: Pick<User, 'id' | 'email' | 'fullName' | 'role' | 'roleId' | 'isActive'>;
}

export interface ForgotPasswordResult {
  message: string;
  resetToken?: string;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', {
    email,
    password,
  });
  return data.data;
}

export async function refreshTokenRequest() {
  const { data } = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh');
  return data.data;
}

export async function logoutRequest() {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/logout',
  );
  return data.data;
}

export async function getProfileRequest() {
  const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
  return data.data;
}

export async function forgotPasswordRequest(email: string) {
  const { data } = await apiClient.post<ApiResponse<ForgotPasswordResult>>(
    '/auth/forgot-password',
    { email },
  );
  return data.data;
}

export async function resetPasswordRequest(token: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/reset-password',
    { token, password },
  );
  return data.data;
}
