import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  error?: unknown;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

function getErrorMessage(error: unknown): string | undefined {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return undefined;
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title = 'Something went wrong',
  description,
  error,
  action,
  className,
  compact = false,
}: ErrorStateProps) {
  const errorMessage = getErrorMessage(error);
  const resolvedDescription =
    description ??
    errorMessage ??
    'We could not complete your request. Please try again in a moment.';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact
          ? 'gap-2 py-8'
          : 'gap-4 rounded-xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-12',
        className,
      )}
      role="alert"
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20',
          compact ? 'size-10' : 'size-12',
        )}
      >
        <Icon
          className={cn('text-destructive', compact ? 'size-5' : 'size-6')}
          aria-hidden
        />
      </div>
      <div className="max-w-md space-y-1">
        <p className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>
          {title}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {resolvedDescription}
        </p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
