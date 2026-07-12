import { cn } from '@/lib/utils';

interface SprintTimelineProps {
  startDate: string;
  endDate: string;
  className?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function SprintTimeline({
  startDate,
  endDate,
  className,
}: SprintTimelineProps) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  const total = end - start;
  const todayPercent = clamp(((now - start) / total) * 100, 0, 100);
  const isPast = now > end;
  const isFuture = now < start;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isPast
              ? 'bg-muted-foreground/40'
              : isFuture
                ? 'bg-primary/20'
                : 'bg-primary/50',
          )}
          style={{ width: `${isFuture ? 0 : isPast ? 100 : todayPercent}%` }}
        />
        {!isFuture && !isPast ? (
          <div
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm"
            style={{ left: `${todayPercent}%` }}
            title="Today"
          />
        ) : null}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{new Date(startDate).toLocaleDateString()}</span>
        <span>
          {isPast ? 'Ended' : isFuture ? 'Upcoming' : `${Math.round(todayPercent)}% elapsed`}
        </span>
        <span>{new Date(endDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateInputToIso(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}
