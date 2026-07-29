'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingState } from '@/components/shared/loading-state';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getHomepageSectionRequest,
  resetHomepageSectionRequest,
  updateHomepageSectionRequest,
} from '@/features/homepage/api';
import { HOMEPAGE_SECTION_LABELS } from '@/features/homepage/constants';
import { asRecordArray, asString } from '@/features/homepage/utils';
import { ClientsPageContent } from '@/features/clients/components/clients-page-content';
import { cn } from '@/lib/utils';
import type { HomepageSectionKey } from '@/types';

interface CmsSectionEditorPageProps {
  sectionKey: HomepageSectionKey;
}

type ContentItem = Record<string, string>;

function stringifyItems(items: ContentItem[]): ContentItem[] {
  return items.map((item) =>
    Object.fromEntries(
      Object.entries(item).map(([key, value]) => [key, String(value ?? '')]),
    ),
  );
}

export function CmsSectionEditorPage({ sectionKey }: CmsSectionEditorPageProps) {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [items, setItems] = useState<ContentItem[]>([]);
  const [itemMode, setItemMode] = useState<'items' | 'steps' | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const sectionQuery = useQuery({
    queryKey: ['homepage-section-admin', sectionKey],
    queryFn: () => getHomepageSectionRequest(sectionKey),
  });

  useEffect(() => {
    const section = sectionQuery.data;
    if (!section) return;

    setLabel(section.label);
    setSortOrder(section.sortOrder);
    setIsVisible(section.isVisible);

    const content = section.content ?? {};
    const nextFields: Record<string, string> = {};

    for (const [key, value] of Object.entries(content)) {
      if (key === 'items' || key === 'steps') continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        nextFields[key] = String(value);
      }
    }

    setFields(nextFields);

    if (Array.isArray(content.items)) {
      setItemMode('items');
      setItems(
        stringifyItems(
          asRecordArray(content.items).map((item) => ({
            iconKey: asString(item.iconKey),
            label: asString(item.label),
            detail: asString(item.detail),
            title: asString(item.title),
            description: asString(item.description),
          })),
        ),
      );
    } else if (Array.isArray(content.steps)) {
      setItemMode('steps');
      setItems(
        stringifyItems(
          asRecordArray(content.steps).map((item) => ({
            step: asString(item.step),
            title: asString(item.title),
            description: asString(item.description),
          })),
        ),
      );
    } else {
      setItemMode(null);
      setItems([]);
    }
  }, [sectionQuery.data]);

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ['homepage-section-admin', sectionKey],
    });
    void queryClient.invalidateQueries({ queryKey: ['homepage-sections-admin'] });
    void queryClient.invalidateQueries({ queryKey: ['homepage-public'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const content: Record<string, unknown> = { ...fields };

      if (itemMode === 'items') {
        content.items = items;
      }
      if (itemMode === 'steps') {
        content.steps = items;
      }

      return updateHomepageSectionRequest(sectionKey, {
        label: label.trim(),
        sortOrder,
        isVisible,
        content,
      });
    },
    onSuccess: () => {
      toast.success('Section saved');
      invalidate();
    },
    onError: () => toast.error('Failed to save section'),
  });

  const resetMutation = useMutation({
    mutationFn: () => resetHomepageSectionRequest(sectionKey),
    onSuccess: () => {
      toast.success('Section reset to defaults');
      setResetOpen(false);
      invalidate();
    },
    onError: () => toast.error('Failed to reset section'),
  });

  if (sectionQuery.isLoading) {
    return <LoadingState message="Loading section..." />;
  }

  if (sectionQuery.isError || !sectionQuery.data) {
    return (
      <ErrorState
        title="Failed to load section"
        description={`Could not load ${sectionKey}.`}
        error={sectionQuery.error}
        action={
          <Button onClick={() => void sectionQuery.refetch()}>Retry</Button>
        }
      />
    );
  }

  const itemKeys =
    itemMode === 'steps'
      ? (['step', 'title', 'description'] as const)
      : sectionKey === 'HIGHLIGHTS'
        ? (['iconKey', 'label', 'detail'] as const)
        : (['iconKey', 'title', 'description'] as const);

  return (
    <div
      className={cn(
        'mx-auto space-y-6',
        sectionKey === 'CLIENTS' ? 'max-w-4xl' : 'max-w-3xl',
      )}
    >      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Link
            href="/cms"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              '-ml-2 w-fit',
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to CMS
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {HOMEPAGE_SECTION_LABELS[sectionKey]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Customize content, position, and visibility for this homepage
            segment.
            {sectionKey === 'CLIENTS'
              ? ' Manage client cards (name, logo, description) below.'
              : null}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setResetOpen(true)}
        >
          <RotateCcw className="size-3.5" />
          Reset defaults
        </Button>
      </div>

      <form
        className="space-y-6 rounded-xl border p-4 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cms-label">Admin label</Label>
            <Input
              id="cms-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cms-sort">Sort order</Label>
            <Input
              id="cms-sort"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cms-visible">Visibility</Label>
            <select
              id="cms-visible"
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={isVisible ? 'true' : 'false'}
              onChange={(event) =>
                setIsVisible(event.target.value === 'true')
              }
            >
              <option value="true">Visible on homepage</option>
              <option value="false">Hidden</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Content
          </h2>
          {Object.keys(fields).map((fieldKey) => (
            <div key={fieldKey} className="space-y-2">
              <Label htmlFor={`cms-field-${fieldKey}`}>{fieldKey}</Label>
              {fieldKey === 'body' ||
              fieldKey === 'subheading' ||
              fieldKey === 'headline' ? (
                <textarea
                  id={`cms-field-${fieldKey}`}
                  rows={fieldKey === 'body' || fieldKey === 'subheading' ? 4 : 2}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  value={fields[fieldKey] ?? ''}
                  onChange={(event) =>
                    setFields((prev) => ({
                      ...prev,
                      [fieldKey]: event.target.value,
                    }))
                  }
                />
              ) : (
                <Input
                  id={`cms-field-${fieldKey}`}
                  value={fields[fieldKey] ?? ''}
                  onChange={(event) =>
                    setFields((prev) => ({
                      ...prev,
                      [fieldKey]: event.target.value,
                    }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        {itemMode ? (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {itemMode === 'steps' ? 'Steps' : 'Items'}
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const blank = Object.fromEntries(
                    itemKeys.map((key) => [key, '']),
                  ) as ContentItem;
                  setItems((prev) => [...prev, blank]);
                }}
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={`${itemMode}-${index}`}
                className="space-y-3 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {itemMode === 'steps' ? `Step ${index + 1}` : `Item ${index + 1}`}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {itemKeys.map((key) => (
                    <div
                      key={key}
                      className={cn(
                        'space-y-2',
                        (key === 'description' || key === 'detail') &&
                          'sm:col-span-2',
                      )}
                    >
                      <Label htmlFor={`cms-item-${index}-${key}`}>{key}</Label>
                      {key === 'description' || key === 'detail' ? (
                        <textarea
                          id={`cms-item-${index}-${key}`}
                          rows={3}
                          className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                          value={item[key] ?? ''}
                          onChange={(event) =>
                            setItems((prev) =>
                              prev.map((row, rowIndex) =>
                                rowIndex === index
                                  ? { ...row, [key]: event.target.value }
                                  : row,
                              ),
                            )
                          }
                        />
                      ) : (
                        <Input
                          id={`cms-item-${index}-${key}`}
                          value={item[key] ?? ''}
                          onChange={(event) =>
                            setItems((prev) =>
                              prev.map((row, rowIndex) =>
                                rowIndex === index
                                  ? { ...row, [key]: event.target.value }
                                  : row,
                              ),
                            )
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Link
            href="/cms"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            Cancel
          </Link>
          <LoadingButton
            type="submit"
            loading={saveMutation.isPending}
            loadingText="Saving..."
          >
            Save changes
          </LoadingButton>
        </div>
      </form>

      {sectionKey === 'CLIENTS' ? (
        <div className="rounded-xl border p-4 sm:p-6">
          <ClientsPageContent embedded />
        </div>
      ) : null}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset section to defaults?"
        description="This replaces the current content, order, and visibility with the built-in defaults. Client cards are not affected."
        confirmLabel="Reset"
        loading={resetMutation.isPending}
        onConfirm={async () => {
          await resetMutation.mutateAsync();
        }}
      />
    </div>
  );
}
