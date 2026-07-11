'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getUnreadCountRequest } from '@/features/notifications/api';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const unreadQuery = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: getUnreadCountRequest,
  });

  const unreadCount = unreadQuery.data ?? 0;

  return (
    <Link
      href="/notifications"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'relative',
      )}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      <Bell className="size-4" />
      {unreadCount > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
