'use client';

import Link from 'next/link';
import { useIsAuthenticated } from '@/components/layouts/use-is-authenticated';
import { SmoothScrollLink } from '@/components/shared/smooth-scroll-link';
import { AUTH_ROUTES } from '@/lib/auth.constants';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface AppFooterProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function AppFooter({ className, variant = 'compact' }: AppFooterProps) {
  const isAuthenticated = useIsAuthenticated();

  const footerLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Projects & sprints', href: '#projects' },
    { label: 'How it works', href: '#workflow' },
    {
      label: isAuthenticated ? 'Dashboard' : 'Sign in',
      href: isAuthenticated ? AUTH_ROUTES.dashboard : AUTH_ROUTES.login,
    },
  ];

  if (variant === 'full') {
    return (
      <footer
        className={cn(
          'border-t border-border/60 bg-muted/20',
          className,
        )}
      >
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Internal service desk platform by Azure Enterprise — organize work
                by project and sprint, with full ticket traceability.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Explore</p>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('#') ? (
                      <SmoothScrollLink
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </SmoothScrollLink>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Platform</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Project &amp; sprint management</li>
                <li>Ticket workflow &amp; tracking</li>
                <li>Real-time notifications</li>
                <li>Role-based collaboration</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
            <p className="text-center text-xs tracking-wide text-muted-foreground sm:text-left">
              Copyright &copy; 2026 Azure Enterprise. All rights reserved.
            </p>
            <p className="text-center text-xs text-muted-foreground sm:text-right">
              Built for internal teams · Secure · Enterprise-ready
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn(
        'border-t border-border/60 bg-background/80 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex h-12 items-center justify-center px-6">
        <p className="text-center text-xs tracking-wide text-muted-foreground">
          Copyright &copy; 2026 Azure Enterprise. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
