'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, Inbox, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getNotificationHref,
  getNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from '@/features/notifications/api';
import { NOTIFICATION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types';

export function NotificationsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const notificationsQuery = useQuery({
    queryKey: ['notifications', page, readFilter],
    queryFn: () =>
      getNotificationsRequest({
        page,
        limit: 15,
        isRead:
          readFilter === 'all'
            ? undefined
            : readFilter === 'read',
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationReadRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadRequest,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleNotificationClick = async (notification: {
    id: string;
    isRead: boolean;
    data?: Record<string, unknown> | null;
  }) => {
    if (!notification.isRead) {
      await markReadMutation.mutateAsync(notification.id);
    }

    const href = getNotificationHref(notification as never);
    if (href) {
      router.push(href);
    }
  };

  const notifications = notificationsQuery.data?.items ?? [];
  const meta = notificationsQuery.data?.meta;

  const emptyStateConfig =
    readFilter === 'unread'
      ? {
          icon: BellOff,
          title: 'No unread notifications',
          description:
            'You are all caught up. New ticket updates and mentions will appear here.',
        }
      : readFilter === 'read'
        ? {
            icon: Inbox,
            title: 'No read notifications',
            description:
              'Notifications you have opened will be listed here for reference.',
          }
        : {
            icon: Bell,
            title: 'No notifications yet',
            description:
              'Activity on your tickets — assignments, status changes, comments, and mentions — will show up here.',
          };

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on ticket activity and mentions.
            </p>
          </div>
          <LoadingButton
            variant="outline"
            loading={markAllReadMutation.isPending}
            loadingText="Marking..."
            disabled={
              notificationsQuery.isLoading ||
              notificationsQuery.isError ||
              notifications.length === 0
            }
            onClick={() => markAllReadMutation.mutate()}
          >
            Mark all as read
          </LoadingButton>
        </div>

        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((filter) => (
            <Button
              key={filter}
              variant={readFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setReadFilter(filter);
                setPage(1);
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {notificationsQuery.isLoading ? (
          <LoadingState message="Loading notifications..." />
        ) : notificationsQuery.isError ? (
          <ErrorState
            icon={WifiOff}
            title="Failed to load notifications"
            description="We could not reach the server. Your notifications will appear here once the connection is restored."
            error={notificationsQuery.error}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void notificationsQuery.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            {...emptyStateConfig}
            action={
              readFilter !== 'all' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReadFilter('all');
                    setPage(1);
                  }}
                >
                  Show all notifications
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => void handleNotificationClick(notification)}
                className={cn(
                  'flex w-full flex-col gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50',
                  !notification.isRead && 'border-primary/30 bg-primary/5',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant="outline">
                      {NOTIFICATION_TYPE_LABELS[notification.type as NotificationType]}
                    </Badge>
                    {!notification.isRead ? (
                      <span className="size-2 rounded-full bg-primary" />
                    ) : null}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        )}

        {meta && !notificationsQuery.isError ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages} ({meta.total} notifications)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
  );
}
