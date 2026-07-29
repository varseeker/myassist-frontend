import {
  BarChart3,
  Bell,
  FolderKanban,
  Headphones,
  Layers,
  MessageSquare,
  Shield,
  Ticket,
  Users,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  Bell,
  FolderKanban,
  Headphones,
  Layers,
  MessageSquare,
  Shield,
  Ticket,
  Users,
  Workflow,
  Zap,
};

export function resolveHomepageIcon(iconKey?: string): LucideIcon {
  if (!iconKey) {
    return FolderKanban;
  }

  return ICON_MAP[iconKey] ?? FolderKanban;
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null && !Array.isArray(item),
  );
}
