'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState } from '@/components/shared/loading-state';
import { useAuthStore } from '@/features/auth/store';
import { UsersPageContent } from '@/features/users/components/users-page-content';

export function AdminUsersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && user?.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return <LoadingState fullScreen message="Loading..." />;
  }

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return <UsersPageContent />;
}