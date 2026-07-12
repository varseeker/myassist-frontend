import {
  NOTIFICATION_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPES,
  USER_ROLES,
} from '@/lib/constants';

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketType = (typeof TICKET_TYPES)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  whatsappEnabled?: boolean;
  telegramChatId?: string | null;
  telegramEnabled?: boolean;
  telegramLinkToken?: string | null;
  role: UserRole;
  roleId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  projects?: UserProjectSummary[];
}

export interface UserProjectSummary {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sprintCount?: number;
  memberCount?: number;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: UserRole;
  description?: string | null;
}

export interface TicketUserSummary {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface TicketHistory {
  id: string;
  action: string;
  fromStatus?: TicketStatus | null;
  toStatus?: TicketStatus | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user: TicketUserSummary;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  projectId: string;
  sprintId?: string | null;
  createdById: string;
  assignedToId?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: TicketUserSummary;
  assignedTo?: TicketUserSummary | null;
  project?: TicketProjectSummary;
  sprint?: TicketSprintSummary | null;
  availableTransitions?: TicketStatus[];
}

export interface TicketProjectSummary {
  id: string;
  name: string;
  code: string;
}

export interface TicketSprintSummary {
  id: string;
  name: string;
  isActive: boolean;
}

export interface TicketDetail extends Ticket {
  histories: TicketHistory[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: TicketUserSummary;
  mentions: TicketUserSummary[];
  isEdited: boolean;
}

export interface MentionableUser {
  id: string;
  fullName: string;
  email: string;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploadedBy: TicketUserSummary;
}

export interface AttachmentDownload {
  url: string;
  expiresIn: number;
  fileName: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  unreadNotifications: number;
  totalUsers?: number;
}

export interface DashboardCountItem {
  label: string;
  count: number;
}

export interface DashboardTrendItem {
  date: string;
  count: number;
}

export interface DashboardRecentTicket {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  createdAt: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  ticketsByStatus: DashboardCountItem[];
  ticketsByPriority: DashboardCountItem[];
  ticketsByType: DashboardCountItem[];
  ticketsTrend: DashboardTrendItem[];
  recentTickets: DashboardRecentTicket[];
}
