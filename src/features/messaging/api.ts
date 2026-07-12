import { apiClient } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface WhatsAppSessionStatus {
  driver: 'baileys' | 'meta' | 'off';
  connected: boolean;
  status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'disabled';
  phoneNumber?: string | null;
  qrDataUrl?: string | null;
  lastError?: string | null;
  updatedAt: string;
}

export interface TelegramStatus {
  enabled: boolean;
  botUsername?: string | null;
  deepLinkPrefix?: string | null;
}

export interface MessagingStatus {
  whatsapp: WhatsAppSessionStatus;
  telegram: TelegramStatus;
}

export async function getMessagingStatusRequest() {
  const { data } = await apiClient.get<ApiResponse<MessagingStatus>>(
    '/messaging/status',
  );
  return data.data;
}

export async function connectWhatsAppRequest() {
  const { data } = await apiClient.post<ApiResponse<WhatsAppSessionStatus>>(
    '/messaging/whatsapp/connect',
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
