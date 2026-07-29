import { notFound } from 'next/navigation';
import { AdminCmsSectionPage } from '@/features/homepage';
import { HOMEPAGE_SECTION_KEYS } from '@/features/homepage/constants';
import type { HomepageSectionKey } from '@/types';

interface CmsSectionRoutePageProps {
  params: Promise<{ key: string }>;
}

export default async function CmsSectionRoutePage({
  params,
}: CmsSectionRoutePageProps) {
  const { key } = await params;
  const sectionKey = key.toUpperCase() as HomepageSectionKey;

  if (!HOMEPAGE_SECTION_KEYS.includes(sectionKey)) {
    notFound();
  }

  return <AdminCmsSectionPage sectionKey={sectionKey} />;
}
