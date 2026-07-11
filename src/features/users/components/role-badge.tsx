import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const roleStyles: Record<UserRole, string> = {
  ADMIN: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  QA: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  DEVELOPER: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  USER: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  QA: 'QA',
  DEVELOPER: 'Developer',
  USER: 'User',
};

export function RoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(roleStyles[role], className)}>
      {roleLabels[role]}
    </Badge>
  );
}
