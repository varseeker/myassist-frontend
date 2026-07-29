'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createClientRequest,
  deleteClientRequest,
  getClientsRequest,
  updateClientRequest,
  uploadClientLogoRequest,
} from '@/features/clients/api';
import {
  clientFormSchema,
  type ClientFormValues,
} from '@/features/clients/schemas';
import type { Client } from '@/types';

interface ClientsPageContentProps {
  /** Hide page chrome when nested inside CMS Clients section. */
  embedded?: boolean;
}

export function ClientsPageContent({
  embedded = false,
}: ClientsPageContentProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const clientsQuery = useQuery({
    queryKey: ['clients-admin'],
    queryFn: () => getClientsRequest({ page: 1, limit: 50 }),
  });

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema as never),
    defaultValues: {
      name: '',
      companyName: '',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }

    if (editing) {
      form.reset({
        name: editing.name,
        companyName: editing.companyName ?? '',
        description: editing.description,
        logoUrl: editing.logoUrl ?? '',
        websiteUrl: editing.websiteUrl ?? '',
        sortOrder: editing.sortOrder,
        isActive: editing.isActive,
      });
    } else {
      form.reset({
        name: '',
        companyName: '',
        description: '',
        logoUrl: '',
        websiteUrl: '',
        sortOrder: (clientsQuery.data?.items.length ?? 0) + 1,
        isActive: true,
      });
    }
    setLogoFile(null);
  }, [dialogOpen, editing, form, clientsQuery.data?.items.length]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['clients-admin'] });
    void queryClient.invalidateQueries({ queryKey: ['clients-public'] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      const payload = {
        name: values.name.trim(),
        companyName: values.companyName?.trim() || undefined,
        description: values.description.trim(),
        logoUrl: values.logoUrl?.trim() || undefined,
        websiteUrl: values.websiteUrl?.trim() || undefined,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };

      const saved = editing
        ? await updateClientRequest(editing.id, payload)
        : await createClientRequest(payload);

      if (logoFile) {
        return uploadClientLogoRequest(saved.id, logoFile);
      }

      return saved;
    },
    onSuccess: () => {
      toast.success(editing ? 'Client updated' : 'Client created');
      setDialogOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClientRequest(id),
    onSuccess: () => {
      toast.success('Client deleted');
      setDeleteTarget(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const clients = clientsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {embedded ? (
            <>
              <h2 className="text-lg font-semibold tracking-tight">
                Client cards
              </h2>
              <p className="text-sm text-muted-foreground">
                Edit Net Fashion Indonesia, KSU Mitra Saudara, and any other
                clients shown on the homepage. Toggle Active/Hidden, reorder,
                and update logos or descriptions.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
              <p className="text-muted-foreground">
                Maintain the Our Clients section shown on the homepage.
              </p>
            </>
          )}
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add client
        </Button>
      </div>

      {clientsQuery.isLoading ? (
        <LoadingState message="Loading clients..." />
      ) : clientsQuery.isError ? (
        <ErrorState
          title="Failed to load clients"
          description="Could not reach the clients API."
          error={clientsQuery.error}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void clientsQuery.refetch()}
            >
              Try again
            </Button>
          }
        />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description="Add your first client to show them on the homepage."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add client
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1.5">
                  {client.logoUrl ? (
                    <Image
                      src={client.logoUrl}
                      alt={client.name}
                      width={56}
                      height={56}
                      className="max-h-12 w-auto object-contain"
                      unoptimized
                    />
                  ) : (
                    <Building2 className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{client.name}</p>
                    <Badge variant={client.isActive ? 'default' : 'outline'}>
                      {client.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                    <Badge variant="outline">Order {client.sortOrder}</Badge>
                  </div>
                  {client.companyName ? (
                    <p className="text-sm text-primary">{client.companyName}</p>
                  ) : null}
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {client.description}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(client);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(client)}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit client' : 'Add client'}
            </DialogTitle>
            <DialogDescription>
              {embedded
                ? 'Changes appear on the homepage when the client is Active and the Clients section is visible.'
                : 'Changes appear on the homepage Our Clients section when the client is active. Section titles are edited in CMS → Clients.'}
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              saveMutation.mutate(values),
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="client-name">Name</Label>
              <Input id="client-name" {...form.register('name')} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-company">Company / legal name</Label>
              <Input id="client-company" {...form.register('companyName')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-description">Description</Label>
              <textarea
                id="client-description"
                rows={5}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                {...form.register('description')}
              />
              {form.formState.errors.description ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client-sort">Sort order</Label>
                <Input
                  id="client-sort"
                  type="number"
                  min={0}
                  {...form.register('sortOrder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-active">Status</Label>
                <select
                  id="client-active"
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={form.watch('isActive') ? 'true' : 'false'}
                  onChange={(event) =>
                    form.setValue('isActive', event.target.value === 'true', {
                      shouldDirty: true,
                    })
                  }
                >
                  <option value="true">Active (shown on homepage)</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-logo-url">Logo URL (optional)</Label>
              <Input
                id="client-logo-url"
                placeholder="/clients/example.png"
                {...form.register('logoUrl')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-logo-file">Or upload logo</Label>
              <Input
                id="client-logo-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={(event) =>
                  setLogoFile(event.target.files?.[0] ?? null)
                }
              />
              {logoFile ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Upload className="size-3" />
                  {logoFile.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-website">Website (optional)</Label>
              <Input
                id="client-website"
                placeholder="https://"
                {...form.register('websiteUrl')}
              />
              {form.formState.errors.websiteUrl ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.websiteUrl.message}
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                loading={saveMutation.isPending}
                loadingText="Saving..."
              >
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete client?"
        description={`Remove "${deleteTarget?.name ?? ''}" from the homepage and maintenance list.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutateAsync(deleteTarget.id);
        }}
      />
    </div>
  );
}
