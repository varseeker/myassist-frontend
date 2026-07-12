import { apiClient } from '@/lib/api';
import type {
  ApiResponse,
  AttachmentDownload,
  MentionableUser,
  PaginatedResponse,
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketDetail,
  TicketPriority,
  TicketStatus,
  TicketType,
} from '@/types';

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  projectId?: string;
  sprintId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  scope?: 'mine' | 'all';
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  type?: TicketType;
  priority?: TicketPriority;
  projectId?: string;
  sprintId?: string;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  type?: TicketType;
  priority?: TicketPriority;
  sprintId?: string;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  assignedToId?: string;
  mentionUserId?: string;
  note: string;
}

export interface Assignee {
  id: string;
  fullName: string;
  email: string;
}

export async function getTicketsRequest(params: TicketQueryParams = {}) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Ticket>>>(
    '/tickets',
    { params },
  );
  return data.data;
}

export async function getTicketRequest(id: string) {
  const { data } = await apiClient.get<ApiResponse<TicketDetail>>(
    `/tickets/${id}`,
  );
  return data.data;
}

export async function createTicketRequest(payload: CreateTicketPayload) {
  const { data } = await apiClient.post<ApiResponse<Ticket>>(
    '/tickets',
    payload,
  );
  return data.data;
}

export async function updateTicketRequest(
  id: string,
  payload: UpdateTicketPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Ticket>>(
    `/tickets/${id}`,
    payload,
  );
  return data.data;
}

export async function updateTicketStatusRequest(
  id: string,
  payload: UpdateTicketStatusPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Ticket>>(
    `/tickets/${id}/status`,
    payload,
  );
  return data.data;
}

export async function deleteTicketRequest(id: string) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/tickets/${id}`,
  );
  return data.data;
}

export async function exportTicketsBySprintRequest(
  sprintId: string,
  format: 'csv' | 'xlsx',
) {
  const response = await apiClient.get<Blob>('/tickets/export', {
    params: { sprintId, format },
    responseType: 'blob',
  });

  const disposition = response.headers['content-disposition'] as
    | string
    | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  const filename =
    match?.[1] ??
    `tickets_export_${new Date().toISOString().slice(0, 10)}.${format}`;

  const url = window.URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export async function getAssigneesRequest(projectId?: string) {
  const { data } = await apiClient.get<ApiResponse<Assignee[]>>(
    '/tickets/assignees',
    { params: projectId ? { projectId } : undefined },
  );
  return data.data;
}

export async function getProjectMembersRequest(projectId: string) {
  const { data } = await apiClient.get<ApiResponse<Assignee[]>>(
    '/tickets/project-members',
    { params: { projectId } },
  );
  return data.data;
}

export async function getTicketCommentsRequest(
  ticketId: string,
  params: { page?: number; limit?: number } = {},
) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<TicketComment>>
  >(`/tickets/${ticketId}/comments`, { params });
  return data.data;
}

export async function createTicketCommentRequest(
  ticketId: string,
  payload: { content: string },
) {
  const { data } = await apiClient.post<ApiResponse<TicketComment>>(
    `/tickets/${ticketId}/comments`,
    payload,
  );
  return data.data;
}

export async function updateTicketCommentRequest(
  ticketId: string,
  commentId: string,
  payload: { content: string },
) {
  const { data } = await apiClient.patch<ApiResponse<TicketComment>>(
    `/tickets/${ticketId}/comments/${commentId}`,
    payload,
  );
  return data.data;
}

export async function deleteTicketCommentRequest(
  ticketId: string,
  commentId: string,
) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/tickets/${ticketId}/comments/${commentId}`,
  );
  return data.data;
}

export async function getMentionableUsersRequest(
  ticketId: string,
  search?: string,
) {
  const { data } = await apiClient.get<ApiResponse<MentionableUser[]>>(
    `/tickets/${ticketId}/comments/mentionable-users`,
    { params: { search } },
  );
  return data.data;
}

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_ATTACHMENT_TYPES =
  'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,.zip,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function getTicketAttachmentsRequest(
  ticketId: string,
  params: { page?: number; limit?: number } = {},
) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<TicketAttachment>>
  >(`/tickets/${ticketId}/attachments`, { params });
  return data.data;
}

export async function uploadTicketAttachmentRequest(
  ticketId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<ApiResponse<TicketAttachment>>(
    `/tickets/${ticketId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return data.data;
}

export async function getAttachmentDownloadUrlRequest(
  ticketId: string,
  attachmentId: string,
) {
  const { data } = await apiClient.get<ApiResponse<AttachmentDownload>>(
    `/tickets/${ticketId}/attachments/${attachmentId}/download-url`,
  );
  return data.data;
}

export async function deleteTicketAttachmentRequest(
  ticketId: string,
  attachmentId: string,
) {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/tickets/${ticketId}/attachments/${attachmentId}`,
  );
  return data.data;
}
