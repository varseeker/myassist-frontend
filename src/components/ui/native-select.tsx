import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NativeSelectProps
  extends React.ComponentProps<'select'> {
  containerClassName?: string;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, containerClassName, children, ...props }, ref) => {
    return (
      <div className={cn('relative w-full', containerClassName)}>
        <select
          ref={ref}
          data-slot="native-select"
          className={cn(
            'h-9 w-full min-w-0 appearance-none rounded-lg border border-input bg-background py-1 pl-3 pr-9 text-sm text-foreground shadow-xs transition-colors outline-none',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-input/30',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    );
  },
);

NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
