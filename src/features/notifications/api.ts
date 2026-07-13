import { apiClient } from '@/lib/api';
import type { ApiResponse, Notification, NotificationType, PaginatedResponse } from '@/types';

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export async function getNotificationsRequest(
  params: NotificationQueryParams = {},
) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<Notification>>
  >('/notifications', { params });
  return data.data;
}

export async function getUnreadCountRequest() {
  const { data } = await apiClient.get<ApiResponse<{ count: number }>>(
    '/notifications/unread-count',
  );
  return data.data.count;
}

export async function markNotificationReadRequest(id: string) {
  const { data } = await apiClient.patch<ApiResponse<Notification>>(
    `/notifications/${id}/read`,
  );
  return data.data;
}

export async function markAllNotificationsReadRequest() {
  const { data } = await apiClient.patch<ApiResponse<{ message: string }>>(
    '/notifications/read-all',
  );
  return data.data;
}

export async function deleteNotificationRequest(id: string) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/notifications/${id}`,
  );
  return data.data;
}

export async function deleteAllNotificationsRequest() {
  const { data } = await apiClient.delete<
    ApiResponse<{ message: string; deletedCount: number }>
  >('/notifications');
  return data.data;
}

export function getNotificationHref(notification: Notification): string | null {
  const ticketId = notification.data?.ticketId;

  if (typeof ticketId === 'string') {
    return `/tickets/${ticketId}`;
  }

  return null;
}
