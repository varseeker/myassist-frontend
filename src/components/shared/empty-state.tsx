import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact
          ? 'gap-2 py-8'
          : 'gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12',
        className,
      )}
      role="status"
    >
      {Icon ? (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted ring-1 ring-border/60',
            compact ? 'size-10' : 'size-12',
          )}
        >
          <Icon
            className={cn('text-muted-foreground', compact ? 'size-5' : 'size-6')}
            aria-hidden
          />
        </div>
      ) : null}
      <div className="max-w-md space-y-1">
        <p className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>
          {title}
        </p>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
