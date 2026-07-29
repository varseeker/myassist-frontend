import { apiClient } from '@/lib/api';
import type { ApiResponse, Client, PaginatedResponse } from '@/types';

export interface ClientPayload {
  name: string;
  companyName?: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export async function getPublicClientsRequest() {
  const { data } = await apiClient.get<ApiResponse<Client[]>>('/clients/public');
  return data.data;
}

export async function getClientsRequest(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Client>>>(
    '/clients',
    { params },
  );
  return data.data;
}

export async function createClientRequest(payload: ClientPayload) {
  const { data } = await apiClient.post<ApiResponse<Client>>(
    '/clients',
    payload,
  );
  return data.data;
}

export async function updateClientRequest(id: string, payload: Partial<ClientPayload>) {
  const { data } = await apiClient.patch<ApiResponse<Client>>(
    `/clients/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteClientRequest(id: string) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/clients/${id}`,
  );
  return data.data;
}

export async function uploadClientLogoRequest(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ApiResponse<Client>>(
    `/clients/${id}/logo`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data.data;
}
