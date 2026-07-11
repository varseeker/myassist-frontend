'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LoadingState } from '@/components/shared/loading-state';
import { useAuthStore } from '@/features/auth/store';
import { redirectToLogin } from '@/lib/auth.utils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!accessToken || !user) {
      redirectToLogin({ redirect: pathname, sessionExpired: true });
    }
  }, [isHydrated, accessToken, user, pathname]);

  if (!isHydrated) {
    return <LoadingState fullScreen message="Loading session..." />;
  }

  if (!accessToken || !user) {
    return <LoadingState fullScreen message="Redirecting to login..." />;
  }

  return <>{children}</>;
}
