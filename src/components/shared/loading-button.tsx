import type { ComponentProps } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/shared/spinner';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

type LoadingButtonProps = ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    loadingText?: string;
  };

export function LoadingButton({
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="text-current" />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
