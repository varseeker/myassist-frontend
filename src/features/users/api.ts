import { apiClient } from '@/lib/api';
import type {
  ApiResponse,
  PaginatedResponse,
  Role,
  User,
  UserRole,
} from '@/types';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  whatsappEnabled?: boolean;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  projectIds?: string[];
}

export interface UpdateUserPayload {
  username?: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
  phoneNumber?: string | null;
  whatsappEnabled?: boolean;
  telegramChatId?: string | null;
  telegramEnabled?: boolean;
  projectIds?: string[];
}

export async function getUsersRequest(params: UserQueryParams = {}) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
    '/users',
    { params },
  );
  return data.data;
}

export async function getUserRequest(id: string) {
  const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return data.data;
}

export async function createUserRequest(payload: CreateUserPayload) {
  const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
  return data.data;
}

export async function updateUserRequest(id: string, payload: UpdateUserPayload) {
  const { data } = await apiClient.patch<ApiResponse<User>>(
    `/users/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteUserRequest(id: string) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/users/${id}`,
  );
  return data.data;
}

export async function getRolesRequest() {
  const { data } = await apiClient.get<ApiResponse<Role[]>>('/roles');
  return data.data;
}
