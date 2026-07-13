import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Project, Sprint } from '@/types';

export async function getProjectsRequest(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Project>>>(
    '/projects',
    { params },
  );
  return data.data;
}

export async function createProjectRequest(payload: {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}) {
  const { data } = await apiClient.post<ApiResponse<Project>>('/projects', payload);
  return data.data;
}

export async function updateProjectRequest(
  id: string,
  payload: Partial<{
    name: string;
    code: string;
    description: string;
    isActive: boolean;
  }>,
) {
  const { data } = await apiClient.patch<ApiResponse<Project>>(
    `/projects/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteProjectRequest(id: string) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/projects/${id}`,
  );
  return data.data;
}

export async function getProjectSprintsRequest(
  projectId: string,
  activeOnly = false,
) {
  const { data } = await apiClient.get<ApiResponse<Sprint[]>>(
    `/projects/${projectId}/sprints`,
    { params: { activeOnly } },
  );
  return data.data;
}

export interface ProjectMember {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  role: string;
}

export interface AssignableUser extends ProjectMember {
  projectCount: number;
}

export async function getProjectMembersListRequest(projectId: string) {
  const { data } = await apiClient.get<ApiResponse<ProjectMember[]>>(
    `/projects/${projectId}/members`,
  );
  return data.data;
}

export async function getAssignableUsersRequest(
  projectId: string,
  search?: string,
) {
  const { data } = await apiClient.get<ApiResponse<AssignableUser[]>>(
    `/projects/${projectId}/assignable-users`,
    { params: { search: search || undefined } },
  );
  return data.data;
}

export async function assignProjectMemberRequest(
  projectId: string,
  userId: string,
) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    `/projects/${projectId}/members`,
    { userId },
  );
  return data.data;
}

export async function removeProjectMemberRequest(
  projectId: string,
  userId: string,
) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/projects/${projectId}/members/${userId}`,
  );
  return data.data;
}

export async function createSprintRequest(
  projectId: string,
  payload: {
    name: string;
    goal?: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  },
) {
  const { data } = await apiClient.post<ApiResponse<Sprint>>(
    `/projects/${projectId}/sprints`,
    payload,
  );
  return data.data;
}

export async function updateSprintRequest(
  projectId: string,
  sprintId: string,
  payload: Partial<{
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>,
) {
  const { data } = await apiClient.patch<ApiResponse<Sprint>>(
    `/projects/${projectId}/sprints/${sprintId}`,
    payload,
  );
  return data.data;
}

export async function deleteSprintRequest(projectId: string, sprintId: string) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/projects/${projectId}/sprints/${sprintId}`,
  );
  return data.data;
}
