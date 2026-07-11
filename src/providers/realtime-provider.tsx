'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';
import { REALTIME_EVENTS } from '@/lib/realtime.events';
import {
  connectRealtimeSocket,
  disconnectRealtimeSocket,
} from '@/lib/socket';
import type { Notification } from '@/types';

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated || !accessToken || !user) {
      disconnectRealtimeSocket();
      return;
    }

    const socket = connectRealtimeSocket(accessToken);

    const handleNewNotification = (notification: Notification) => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      toast(notification.title, {
        description: notification.message,
      });
    };

    const handleUnreadCount = ({ count }: { count: number }) => {
      queryClient.setQueryData(['notifications-unread'], count);
    };

    socket.on(REALTIME_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    socket.on(REALTIME_EVENTS.NOTIFICATION_UNREAD_COUNT, handleUnreadCount);

    return () => {
      socket.off(REALTIME_EVENTS.NOTIFICATION_NEW, handleNewNotification);
      socket.off(REALTIME_EVENTS.NOTIFICATION_UNREAD_COUNT, handleUnreadCount);
      disconnectRealtimeSocket();
    };
  }, [accessToken, isHydrated, queryClient, user]);

  return <>{children}</>;
}
