import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TicketPriority, TicketStatus } from '@/types';

const statusConfig: Record<
  TicketStatus,
  { label: string; className: string }
> = {
  OPEN: { label: 'Open', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  USER_INPUT: {
    label: 'User Input',
    className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  },
  QA_REVIEW: {
    label: 'QA Review',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  WAITING_INFORMATION: {
    label: 'Waiting Info',
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  REOPENED: {
    label: 'Reopened',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
};

const priorityConfig: Record<
  TicketPriority,
  { label: string; className: string }
> = {
  LOW: { label: 'Low', className: 'bg-slate-500/10 text-slate-600' },
  MEDIUM: { label: 'Medium', className: 'bg-blue-500/10 text-blue-600' },
  HIGH: { label: 'High', className: 'bg-orange-500/10 text-orange-600' },
  CRITICAL: { label: 'Critical', className: 'bg-red-500/10 text-red-600' },
};

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
