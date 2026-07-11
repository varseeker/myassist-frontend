'use client';

import { ArrowRight, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useIsAuthenticated } from '@/components/layouts/use-is-authenticated';
import { SmoothScrollLink } from '@/components/shared/smooth-scroll-link';
import { buttonVariants } from '@/components/ui/button';
import { AUTH_ROUTES } from '@/lib/auth.constants';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function LandingHero() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <section className="relative overflow-hidden">
      <div className="landing-hero-glow absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-primary)/0.12,transparent)]" />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div
          className={cn(
            'landing-hero-item inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm',
          )}
          style={{ '--landing-hero-delay': '0ms' } as React.CSSProperties}
        >
          <Headphones className="size-3.5 text-primary" />
          Internal Service Desk Platform
        </div>
        <h1
          className="landing-hero-item mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          style={{ '--landing-hero-delay': '80ms' } as React.CSSProperties}
        >
          Manage support requests with clarity and speed
        </h1>
        <p
          className="landing-hero-item mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          style={{ '--landing-hero-delay': '160ms' } as React.CSSProperties}
        >
          {APP_NAME} is Azure Enterprise&apos;s modern service desk — organize
          support by <strong className="font-medium text-foreground">project</strong>{' '}
          and <strong className="font-medium text-foreground">sprint</strong>,
          assign the right teams, and track every ticket from submission to
          resolution.
        </p>
        <div
          className="landing-hero-item mt-8 flex flex-wrap gap-3"
          style={{ '--landing-hero-delay': '240ms' } as React.CSSProperties}
        >
          <Link
            href={isAuthenticated ? AUTH_ROUTES.dashboard : AUTH_ROUTES.login}
            className={cn(buttonVariants({ size: 'lg' }), 'group')}
          >
            {isAuthenticated ? 'Go to dashboard' : 'Get started'}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <SmoothScrollLink
            href="#workflow"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            See how it works
          </SmoothScrollLink>
        </div>
      </div>
    </section>
  );
}
