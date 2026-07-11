import { apiClient } from '@/lib/api';
import type { ApiResponse, DashboardData } from '@/types';

export async function getDashboardSummaryRequest() {
  const { data } = await apiClient.get<ApiResponse<DashboardData>>(
    '/dashboard/summary',
  );
  return data.data;
}
