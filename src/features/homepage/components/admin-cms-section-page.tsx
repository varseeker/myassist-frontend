'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState } from '@/components/shared/loading-state';
import { useAuthStore } from '@/features/auth/store';
import { CmsSectionEditorPage } from '@/features/homepage/components/cms-section-editor-page';
import type { HomepageSectionKey } from '@/types';

interface AdminCmsSectionPageProps {
  sectionKey: HomepageSectionKey;
}

export function AdminCmsSectionPage({ sectionKey }: AdminCmsSectionPageProps) {
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

  return <CmsSectionEditorPage sectionKey={sectionKey} />;
}
