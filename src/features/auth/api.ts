import { apiClient } from '@/lib/api';
import type { ApiResponse, User } from '@/types';

export interface AuthTokens {
  accessToken: string;
  user: Pick<
    User,
    'id' | 'username' | 'email' | 'fullName' | 'role' | 'roleId' | 'isActive'
  >;
}

export interface ForgotPasswordResult {
  message: string;
  resetToken?: string;
}

export async function loginRequest(username: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', {
    username,
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

export async function registerRequest(payload: {
  username: string;
  email?: string;
  fullName: string;
  password: string;
}) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/register',
    payload,
  );
  return data.data;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string | null;
  fullName?: string;
  phoneNumber?: string | null;
  whatsappEnabled?: boolean;
  telegramChatId?: string | null;
  telegramEnabled?: boolean;
}

export async function updateProfileRequest(payload: UpdateProfilePayload) {
  const { data } = await apiClient.patch<ApiResponse<User>>(
    '/auth/profile',
    payload,
  );
  return data.data;
}
