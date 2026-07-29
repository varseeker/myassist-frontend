'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  LayoutTemplate,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  getHomepageSectionsRequest,
  reorderHomepageSectionsRequest,
  updateHomepageSectionRequest,
} from '@/features/homepage/api';
import { HOMEPAGE_SECTION_LABELS } from '@/features/homepage/constants';
import { cn } from '@/lib/utils';
import type { HomepageSection } from '@/types';

export function CmsOverviewPage() {
  const queryClient = useQueryClient();

  const sectionsQuery = useQuery({
    queryKey: ['homepage-sections-admin'],
    queryFn: getHomepageSectionsRequest,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['homepage-sections-admin'] });
    void queryClient.invalidateQueries({ queryKey: ['homepage-public'] });
  };

  const visibilityMutation = useMutation({
    mutationFn: ({
      section,
      isVisible,
    }: {
      section: HomepageSection;
      isVisible: boolean;
    }) =>
      updateHomepageSectionRequest(section.key, {
        isVisible,
      }),
    onSuccess: () => {
      toast.success('Visibility updated');
      invalidate();
    },
    onError: () => toast.error('Failed to update visibility'),
  });

  const reorderMutation = useMutation({
    mutationFn: reorderHomepageSectionsRequest,
    onSuccess: () => {
      toast.success('Section order updated');
      invalidate();
    },
    onError: () => toast.error('Failed to reorder sections'),
  });

  const moveSection = (index: number, direction: -1 | 1) => {
    const sections = sectionsQuery.data;
    if (!sections) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    reorderMutation.mutate(
      next.map((section, orderIndex) => ({
        key: section.key,
        sortOrder: (orderIndex + 1) * 10,
      })),
    );
  };

  if (sectionsQuery.isLoading) {
    return <LoadingState message="Loading homepage sections..." />;
  }

  if (sectionsQuery.isError) {
    return (
      <ErrorState
        title="Failed to load CMS sections"
        description="Could not reach the homepage CMS API."
        error={sectionsQuery.error}
        action={
          <Button onClick={() => void sectionsQuery.refetch()}>Retry</Button>
        }
      />
    );
  }

  const sections = sectionsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="size-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Homepage CMS</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Atur urutan, tampilan, dan isi setiap segmen di halaman beranda.
          Data klien (Net Fashion, KSU Mitra Saudara, dll.) dikelola di CMS →
          Clients.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">
                  {section.label || HOMEPAGE_SECTION_LABELS[section.key]}
                </p>
                <Badge variant="outline">{section.key}</Badge>
                <Badge variant={section.isVisible ? 'default' : 'outline'}>
                  {section.isVisible ? 'Visible' : 'Hidden'}
                </Badge>
                <Badge variant="outline">Order {section.sortOrder}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Edit content for this homepage segment, or hide it from the
                public landing page.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === 0 || reorderMutation.isPending}
                onClick={() => moveSection(index, -1)}
                aria-label="Move up"
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  index === sections.length - 1 || reorderMutation.isPending
                }
                onClick={() => moveSection(index, 1)}
                aria-label="Move down"
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={visibilityMutation.isPending}
                onClick={() =>
                  visibilityMutation.mutate({
                    section,
                    isVisible: !section.isVisible,
                  })
                }
              >
                {section.isVisible ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                {section.isVisible ? 'Hide' : 'Show'}
              </Button>
              <Link
                href={`/cms/${section.key}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <Pencil className="size-3.5" />
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
