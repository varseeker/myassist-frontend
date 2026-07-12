export const APP_NAME = 'MyAssist';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

export const TICKET_STATUSES = [
  'OPEN',
  'USER_INPUT',
  'QA_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_INFORMATION',
  'DONE',
  'RESOLVED',
  'REOPENED',
  'CLOSED',
  'REJECTED',
] as const;

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const TICKET_TYPES = [
  'BUG_REPORT',
  'ISSUE_REPORT',
  'ENHANCEMENT_REQUEST',
  'SUPPORT_REQUEST',
] as const;

export const USER_ROLES = ['ADMIN', 'QA', 'DEVELOPER', 'USER'] as const;

export const NOTIFICATION_TYPES = [
  'TICKET_CREATED',
  'TICKET_ASSIGNED',
  'TICKET_STATUS_CHANGED',
  'TICKET_COMMENTED',
  'TICKET_MENTIONED',
  'SYSTEM',
] as const;

export const NOTIFICATION_TYPE_LABELS: Record<
  (typeof NOTIFICATION_TYPES)[number],
  string
> = {
  TICKET_CREATED: 'Ticket Created',
  TICKET_ASSIGNED: 'Assigned',
  TICKET_STATUS_CHANGED: 'Status Changed',
  TICKET_COMMENTED: 'New Comment',
  TICKET_MENTIONED: 'Mentioned',
  SYSTEM: 'System',
};

export const TICKET_TYPE_LABELS: Record<
  (typeof TICKET_TYPES)[number],
  string
> = {
  BUG_REPORT: 'Bug Report',
  ISSUE_REPORT: 'Issue Report',
  ENHANCEMENT_REQUEST: 'Enhancement Request',
  SUPPORT_REQUEST: 'Support Request',
};
