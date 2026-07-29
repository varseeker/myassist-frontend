import { apiClient } from '@/lib/api';
import type {
  ApiResponse,
  HomepageSection,
  HomepageSectionKey,
} from '@/types';

export interface UpdateHomepageSectionPayload {
  label?: string;
  sortOrder?: number;
  isVisible?: boolean;
  content?: Record<string, unknown>;
}

export async function getPublicHomepageSectionsRequest() {
  const { data } = await apiClient.get<ApiResponse<HomepageSection[]>>(
    '/homepage/public',
  );
  return data.data;
}

export async function getHomepageSectionsRequest() {
  const { data } = await apiClient.get<ApiResponse<HomepageSection[]>>(
    '/homepage',
  );
  return data.data;
}

export async function getHomepageSectionRequest(key: HomepageSectionKey) {
  const { data } = await apiClient.get<ApiResponse<HomepageSection>>(
    `/homepage/${key}`,
  );
  return data.data;
}

export async function updateHomepageSectionRequest(
  key: HomepageSectionKey,
  payload: UpdateHomepageSectionPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<HomepageSection>>(
    `/homepage/${key}`,
    payload,
  );
  return data.data;
}

export async function reorderHomepageSectionsRequest(
  items: Array<{ key: HomepageSectionKey; sortOrder: number }>,
) {
  const { data } = await apiClient.patch<ApiResponse<HomepageSection[]>>(
    '/homepage/reorder',
    { items },
  );
  return data.data;
}

export async function resetHomepageSectionRequest(key: HomepageSectionKey) {
  const { data } = await apiClient.post<ApiResponse<HomepageSection>>(
    `/homepage/${key}/reset`,
  );
  return data.data;
}
