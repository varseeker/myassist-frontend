import { Home } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PublicHeaderProps {
  className?: string;
  homeHref?: string;
  homeLabel?: string;
}

export function PublicHeader({
  className,
  homeHref = '/',
  homeLabel = 'Homepage',
}: PublicHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group transition-colors">
          <p className="text-xs font-medium tracking-wide text-primary">
            Azure Enterprise
          </p>
          <p className="text-lg font-bold tracking-tight group-hover:text-primary">
            {APP_NAME}
          </p>
        </Link>
        <Link href={homeHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <Home className="size-4" />
          {homeLabel}
        </Link>
      </div>
    </header>
  );
}
