import { apiClient } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface WhatsAppSessionStatus {
  driver: 'baileys' | 'meta' | 'off';
  connected: boolean;
  status:
    | 'disconnected'
    | 'connecting'
    | 'qr'
    | 'connected'
    | 'logged_out'
    | 'disabled';
  phoneNumber?: string | null;
  qrDataUrl?: string | null;
  lastError?: string | null;
  hint?: string | null;
  updatedAt: string;
}

export interface TelegramStatus {
  enabled: boolean;
  botUsername?: string | null;
  deepLinkPrefix?: string | null;
  ingressMode: 'polling' | 'webhook' | 'disabled';
  linkedUsers: number;
  hint?: string | null;
}

export interface MessagingStatus {
  whatsapp: WhatsAppSessionStatus;
  telegram: TelegramStatus;
}

export interface MessagingTestResult {
  whatsapp: { status: string; error?: string } | null;
  telegram: { status: string; error?: string } | null;
}

export async function getMessagingStatusRequest() {
  const { data } = await apiClient.get<ApiResponse<MessagingStatus>>(
    '/messaging/status',
  );
  return data.data;
}

export async function connectWhatsAppRequest(resetSession = false) {
  const { data } = await apiClient.post<ApiResponse<WhatsAppSessionStatus>>(
    '/messaging/whatsapp/connect',
    { resetSession },
  );
  return data.data;
}

export async function disconnectWhatsAppRequest(logout = false) {
  const { data } = await apiClient.post<ApiResponse<WhatsAppSessionStatus>>(
    '/messaging/whatsapp/disconnect',
    { logout },
  );
  return data.data;
}

export async function sendMessagingTestRequest() {
  const { data } = await apiClient.post<ApiResponse<MessagingTestResult>>(
    '/messaging/test',
  );
  return data.data;
}
