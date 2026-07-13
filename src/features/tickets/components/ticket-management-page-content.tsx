'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DataTable } from '@/components/shared/data-table';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingState } from '@/components/shared/loading-state';
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { getProjectsRequest } from '@/features/projects/api';
import {
  bulkDeleteTicketsRequest,
  deleteTicketRequest,
  getTicketsRequest,
} from '@/features/tickets/api';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPE_LABELS,
  TICKET_TYPES,
} from '@/lib/constants';
import type { Ticket, TicketPriority, TicketStatus, TicketType } from '@/types';

type ConfirmDeleteState =
  | { type: 'single'; ticket: Ticket }
  | { type: 'selected'; count: number }
  | { type: 'filter' };

export function TicketManagementPageContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>(
    'ALL',
  );
  const [typeFilter, setTypeFilter] = useState<TicketType | 'ALL'>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState | null>(
    null,
  );

  const filterParams = {
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    projectId: projectFilter === 'ALL' ? undefined : projectFilter,
  };

  const ticketsQuery = useQuery({
    queryKey: [
      'ticket-management',
      page,
      search,
      statusFilter,
      priorityFilter,
      typeFilter,
      projectFilter,
    ],
    queryFn: () =>
      getTicketsRequest({
        page,
        limit: 20,
        ...filterParams,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const projectsQuery = useQuery({
    queryKey: ['ticket-management-projects'],
    queryFn: () =>
      getProjectsRequest({ page: 1, limit: 100, isActive: true }),
  });

  const refreshTickets = async () => {
    setSelectedIds(new Set());
    await queryClient.invalidateQueries({ queryKey: ['ticket-management'] });
    await queryClient.invalidateQueries({ queryKey: ['tickets'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  };

  const deleteOneMutation = useMutation({
    mutationFn: deleteTicketRequest,
    onSuccess: async () => {
      toast.success('Ticket deleted');
      await refreshTickets();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteTicketsRequest,
    onSuccess: async (result) => {
      toast.success(result.message);
      await refreshTickets();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const tickets = ticketsQuery.data?.items ?? [];
  const meta = ticketsQuery.data?.meta;

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    const pageIds = tickets.map((ticket) => ticket.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select page"
            checked={
              tickets.length > 0 &&
              tickets.every((ticket) => selectedIds.has(ticket.id))
            }
            onChange={togglePage}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.ticketNumber}`}
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleId(row.original.id)}
          />
        ),
      },
      {
        accessorKey: 'ticketNumber',
        header: 'Ticket',
        cell: ({ row }) => (
          <Link
            href={`/tickets/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.ticketNumber}
          </Link>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <p className="max-w-xs truncate text-sm">{row.original.title}</p>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) =>
          TICKET_TYPE_LABELS[row.original.type] ?? row.original.type,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={deleteOneMutation.isPending}
            onClick={() =>
              setConfirmDelete({ type: 'single', ticket: row.original })
            }
          >
            <Trash2 className="size-4" />
          </Button>
        ),
      },
    ],
    [tickets, selectedIds, deleteOneMutation.isPending],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Ticket Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Hapus tiket satu per satu, secara massal, atau semua yang cocok dengan
          filter.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Input
          className="sm:max-w-xs"
          placeholder="Search tickets..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <NativeSelect
          containerClassName="sm:w-auto"
          value={projectFilter}
          onChange={(event) => {
            setProjectFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All projects</option>
          {(projectsQuery.data?.items ?? []).map((project) => (
            <option key={project.id} value={project.id}>
              {project.code} — {project.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          containerClassName="sm:w-auto"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as TicketStatus | 'ALL');
            setPage(1);
          }}
        >
          <option value="ALL">All statuses</option>
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll('_', ' ')}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          containerClassName="sm:w-auto"
          value={priorityFilter}
          onChange={(event) => {
            setPriorityFilter(event.target.value as TicketPriority | 'ALL');
            setPage(1);
          }}
        >
          <option value="ALL">All priorities</option>
          {TICKET_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          containerClassName="sm:w-auto"
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(event.target.value as TicketType | 'ALL');
            setPage(1);
          }}
        >
          <option value="ALL">All types</option>
          {TICKET_TYPES.map((type) => (
            <option key={type} value={type}>
              {TICKET_TYPE_LABELS[type]}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-wrap gap-2">
        <LoadingButton
          variant="destructive"
          disabled={selectedIds.size === 0}
          loading={bulkDeleteMutation.isPending}
          loadingText="Deleting..."
          onClick={() =>
            setConfirmDelete({ type: 'selected', count: selectedIds.size })
          }
        >
          <Trash2 className="size-4" />
          Delete selected ({selectedIds.size})
        </LoadingButton>
        <LoadingButton
          variant="outline"
          loading={bulkDeleteMutation.isPending}
          loadingText="Deleting..."
          onClick={() => setConfirmDelete({ type: 'filter' })}
        >
          Delete all matching filter
        </LoadingButton>
      </div>

      {ticketsQuery.isLoading ? (
        <LoadingState message="Loading tickets..." />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={tickets}
            emptyState={{
              title: 'No tickets found',
              description:
                'Sesuaikan filter atau pastikan masih ada tiket aktif.',
            }}
          />
          {meta ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} tickets)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
        title="Delete tickets?"
        description={
          confirmDelete?.type === 'single'
            ? `Hapus tiket ${confirmDelete.ticket.ticketNumber}?`
            : confirmDelete?.type === 'selected'
              ? `Hapus ${confirmDelete.count} tiket terpilih?`
              : confirmDelete?.type === 'filter'
                ? 'Hapus SEMUA tiket yang cocok dengan filter saat ini?'
                : ''
        }
        confirmLabel="Delete"
        loading={
          deleteOneMutation.isPending || bulkDeleteMutation.isPending
        }
        onConfirm={async () => {
          if (!confirmDelete) return;
          if (confirmDelete.type === 'single') {
            await deleteOneMutation.mutateAsync(confirmDelete.ticket.id);
          } else if (confirmDelete.type === 'selected') {
            await bulkDeleteMutation.mutateAsync({
              ids: [...selectedIds],
            });
          } else {
            await bulkDeleteMutation.mutateAsync({
              deleteMatchingFilter: true,
              filter: filterParams,
            });
          }
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}
