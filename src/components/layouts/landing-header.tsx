'use client';

import Link from 'next/link';
import { useIsAuthenticated } from '@/components/layouts/use-is-authenticated';
import { SmoothScrollLink } from '@/components/shared/smooth-scroll-link';
import { buttonVariants } from '@/components/ui/button';
import { AUTH_ROUTES } from '@/lib/auth.constants';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function LandingHeader() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary">
            Azure Enterprise
          </p>
          <p className="text-lg font-bold tracking-tight">{APP_NAME}</p>
        </div>
        <div className="flex items-center gap-2">
          <SmoothScrollLink
            href="#projects"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'hidden sm:inline-flex',
            )}
          >
            Projects
          </SmoothScrollLink>
          <SmoothScrollLink
            href="#features"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'hidden sm:inline-flex',
            )}
          >
            Features
          </SmoothScrollLink>
          <Link
            href={isAuthenticated ? AUTH_ROUTES.dashboard : AUTH_ROUTES.login}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            {isAuthenticated ? 'Dashboard' : 'Sign in'}
          </Link>
        </div>
      </div>
    </header>
  );
}
