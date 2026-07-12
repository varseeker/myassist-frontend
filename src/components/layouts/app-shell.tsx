'use client';

import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageCircle,
  PanelLeftClose,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppFooter } from '@/components/layouts/app-footer';
import { useSidebarStore } from '@/components/layouts/sidebar-store';
import { UserMenu } from '@/components/layouts/user-menu';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

const baseNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'QA', 'DEVELOPER', 'USER'],
  },
  {
    href: '/tickets',
    label: 'Tickets',
    icon: Ticket,
    roles: ['ADMIN', 'QA', 'DEVELOPER', 'USER'],
  },
  {
    href: '/projects',
    label: 'Projects',
    icon: FolderKanban,
    roles: ['ADMIN'],
  },
  {
    href: '/users',
    label: 'Users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    href: '/messaging',
    label: 'Messaging',
    icon: MessageCircle,
    roles: ['ADMIN'],
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: Bell,
    roles: ['ADMIN', 'QA', 'DEVELOPER', 'USER'],
  },
];

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarNavProps {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarNav({
  items,
  pathname,
  collapsed,
  onNavigate,
}: SidebarNavProps) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-2 md:p-3">
      {items.map((item) => {
        const active = isNavActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              collapsed && 'justify-center px-2',
              active
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span
              className={cn(
                'truncate',
                collapsed ? 'sr-only' : 'block',
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, className }: AppShellProps) {
  const pathname = usePathname();
  const userRole = useAuthStore((state) => state.user?.role);
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [widthTransitionEnabled, setWidthTransitionEnabled] = useState(false);

  const navItems = baseNavItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : true,
  );

  const sidebarCollapsed = hasHydrated && collapsed;

  useEffect(() => {
    const finishHydration = () => setHasHydrated(true);

    if (useSidebarStore.persist.hasHydrated()) {
      finishHydration();
      return;
    }

    const unsubscribe = useSidebarStore.persist.onFinishHydration(finishHydration);
    void useSidebarStore.persist.rehydrate();

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setWidthTransitionEnabled(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [hasHydrated]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen bg-background">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card shadow-lg md:relative md:z-auto md:translate-x-0 md:shadow-none',
          widthTransitionEnabled &&
            'transition-[width,transform] duration-300 ease-in-out',
          sidebarCollapsed ? 'w-[4.5rem]' : 'w-64',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b md:h-16',
            sidebarCollapsed ? 'justify-center px-2' : 'justify-between gap-3 px-4',
          )}
        >
          {sidebarCollapsed ? (
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
              onClick={toggleCollapsed}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              {APP_NAME.charAt(0)}
            </button>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="min-w-0 truncate text-lg font-semibold tracking-tight text-foreground"
                onClick={() => setMobileNavOpen(false)}
              >
                {APP_NAME}
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="ml-auto hidden shrink-0 md:inline-flex"
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="size-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 md:hidden"
                aria-label="Close navigation menu"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </>
          )}
        </div>

        <SidebarNav
          items={navItems}
          pathname={pathname}
          collapsed={sidebarCollapsed}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:h-16 md:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="md:hidden"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium sm:text-base">
                {APP_NAME}
              </p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                Service Desk Management
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>

        <main
          className={cn(
            'flex-1 p-4 sm:p-5 md:p-6',
            className,
          )}
        >
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
