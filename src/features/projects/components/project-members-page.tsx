'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState } from '@/components/shared/loading-state';
import { useAuthStore } from '@/features/auth/store';
import { ProjectMembersPageContent } from '@/features/projects/components/project-members-page-content';

export function ProjectMembersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (
      isHydrated &&
      user?.role !== 'ADMIN' &&
      user?.role !== 'QA'
    ) {
      router.replace('/dashboard');
    }
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return <LoadingState fullScreen message="Loading..." />;
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'QA') {
    return null;
  }

  return <ProjectMembersPageContent />;
}
