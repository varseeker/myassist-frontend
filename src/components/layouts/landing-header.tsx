'use client';

import Link from 'next/link';
import { useIsAuthenticated } from '@/components/layouts/use-is-authenticated';
import { ThemeToggle } from '@/components/layouts/theme-toggle';
import { SmoothScrollLink } from '@/components/shared/smooth-scroll-link';
import { buttonVariants } from '@/components/ui/button';
import { useVisibleHomepageKeys } from '@/features/homepage/components/landing-page-sections';
import { AUTH_ROUTES } from '@/lib/auth.constants';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function LandingHeader() {
  const isAuthenticated = useIsAuthenticated();
  const visibleKeys = useVisibleHomepageKeys();

  return (
    <header
      data-slot="navbar"
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 font-ui font-medium backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-caption tracking-wide text-primary uppercase">
            Azure Enterprise
          </p>
          <p className="font-heading text-lg font-bold tracking-tight">{APP_NAME}</p>
        </div>
        <div className="flex items-center gap-2">
          {visibleKeys.has('PROJECTS') ? (
            <SmoothScrollLink
              href="#projects"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'hidden sm:inline-flex',
              )}
            >
              Projects
            </SmoothScrollLink>
          ) : null}
          {visibleKeys.has('FEATURES') ? (
            <SmoothScrollLink
              href="#features"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'hidden sm:inline-flex',
              )}
            >
              Features
            </SmoothScrollLink>
          ) : null}
          {visibleKeys.has('CLIENTS') ? (
            <SmoothScrollLink
              href="#clients"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'hidden sm:inline-flex',
              )}
            >
              Clients
            </SmoothScrollLink>
          ) : null}
          <ThemeToggle />
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
