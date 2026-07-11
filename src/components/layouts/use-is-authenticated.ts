'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';

export function useIsAuthenticated() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      void useAuthStore.getState().hydrate();
    }
  }, [isHydrated]);

  return isHydrated && Boolean(accessToken && user);
}
