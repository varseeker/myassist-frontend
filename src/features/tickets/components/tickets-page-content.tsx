'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Plus, SearchX, Ticket as TicketIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/shared/data-table';
import { LoadingState } from '@/components/shared/loading-state';
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { TicketFormDialog } from '@/features/tickets/components/ticket-form-dialog';
import { TicketExportPanel } from '@/features/tickets/components/ticket-export-panel';
import { useAuthStore } from '@/features/auth/store';
import {
  getProjectSprintsRequest,
  getProjectsRequest,
} from '@/features/projects/api';
import {
  createTicketRequest,
  getTicketReportersRequest,
  getTicketsRequest,
  uploadTicketAttachmentRequest,
  type CreateTicketPayload,
} from '@/features/tickets/api';
import type { CreateTicketSubmitPayload } from '@/features/tickets/schemas';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPE_LABELS,
  TICKET_TYPES,
} from '@/lib/constants';
import type { Ticket, TicketPriority, TicketStatus, TicketType } from '@/types';

function isTicketStatus(value: string | null): value is TicketStatus {
  return Boolean(value && (TICKET_STATUSES as readonly string[]).includes(value));
}

function isTicketPriority(value: string | null): value is TicketPriority {
  return Boolean(
    value && (TICKET_PRIORITIES as readonly string[]).includes(value),
  );
}

function isTicketType(value: string | null): value is TicketType {
  return Boolean(value && (TICKET_TYPES as readonly string[]).includes(value));
}

export function TicketsPageContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>(() => {
    const status = searchParams.get('status');
    return isTicketStatus(status) ? status : 'ALL';
  });
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>(
    () => {
      const priority = searchParams.get('priority');
      return isTicketPriority(priority) ? priority : 'ALL';
    },
  );
  const [typeFilter, setTypeFilter] = useState<TicketType | 'ALL'>(() => {
    const type = searchParams.get('type');
    return isTicketType(type) ? type : 'ALL';
  });
  const [createdByFilter, setCreatedByFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [sprintFilter, setSprintFilter] = useState<string>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);

  const reportersQuery = useQuery({
    queryKey: ['ticket-reporters'],
    queryFn: () => getTicketReportersRequest(),
  });

  const projectsQuery = useQuery({
    queryKey: ['ticket-filter-projects'],
    queryFn: () =>
      getProjectsRequest({
        page: 1,
        limit: 100,
        isActive: true,
      }),
  });

  const sprintsQuery = useQuery({
    queryKey: ['ticket-filter-sprints', projectFilter],
    queryFn: () => getProjectSprintsRequest(projectFilter),
    enabled: projectFilter !== 'ALL',
  });

  const ticketsQuery = useQuery({
    queryKey: [
      'tickets',
      page,
      search,
      statusFilter,
      priorityFilter,
      typeFilter,
      createdByFilter,
      projectFilter,
      sprintFilter,
    ],
    queryFn: () =>
      getTicketsRequest({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        createdById:
          createdByFilter === 'ALL' ? undefined : createdByFilter,
        projectId: projectFilter === 'ALL' ? undefined : projectFilter,
        sprintId: sprintFilter === 'ALL' ? undefined : sprintFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const createMutation = useMutation({
    mutationFn: createTicketRequest,
    onSuccess: (ticket) => {
      toast.success(`Ticket ${ticket.ticketNumber} created`);
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const tickets = ticketsQuery.data?.items ?? [];
  const meta = ticketsQuery.data?.meta;
  const hasActiveFilters =
    Boolean(search) ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    createdByFilter !== 'ALL' ||
    projectFilter !== 'ALL' ||
    sprintFilter !== 'ALL';

  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: 'ticketNumber',
        header: 'Ticket',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.ticketNumber}</p>
            <p className="max-w-xs truncate text-xs text-muted-foreground">
              {row.original.title}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'project',
        header: 'Project',
        cell: ({ row }) =>
          row.original.project
            ? `${row.original.project.code}`
            : '—',
      },
      {
        accessorKey: 'sprint',
        header: 'Sprint',
        cell: ({ row }) => row.original.sprint?.name ?? '—',
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => TICKET_TYPE_LABELS[row.original.type],
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
        accessorKey: 'assignedTo',
        header: 'Assignee',
        cell: ({ row }) => row.original.assignedTo?.fullName ?? '—',
      },
      {
        accessorKey: 'createdBy',
        header: 'Created by',
        cell: ({ row }) => row.original.createdBy?.fullName ?? '—',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Link
            href={`/tickets/${row.original.id}`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Eye className="size-3.5" />
            View
          </Link>
        ),
      },
    ],
    [],
  );

  const handleCreate = async ({ values, images }: CreateTicketSubmitPayload) => {
    const payload: CreateTicketPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
    };

    if (user?.role !== 'USER' && 'type' in values) {
      payload.type = values.type;
      payload.priority = values.priority;
      if (values.projectId) {
        payload.projectId = values.projectId;
      }
      if (values.sprintId) {
        payload.sprintId = values.sprintId;
      }
    }

    const ticket = await createMutation.mutateAsync(payload);

    if (images.length > 0) {
      await Promise.all(
        images.map((file) => uploadTicketAttachmentRequest(ticket.id, file)),
      );
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">
              Manage service desk requests and track their progress.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            New Ticket
          </Button>
        </div>

        <TicketExportPanel />

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
          <Input
            placeholder="Search by title or ticket number..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="lg:max-w-xs"
          />
          <NativeSelect
            containerClassName="sm:w-auto"
            value={projectFilter}
            onChange={(event) => {
              setProjectFilter(event.target.value);
              setSprintFilter('ALL');
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
            value={sprintFilter}
            disabled={projectFilter === 'ALL'}
            onChange={(event) => {
              setSprintFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">
              {projectFilter === 'ALL'
                ? 'Select project first'
                : 'All sprints'}
            </option>
            {(sprintsQuery.data ?? []).map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
                {sprint.isActive ? ' (Active)' : ''}
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
          <NativeSelect
            containerClassName="sm:w-auto"
            value={createdByFilter}
            onChange={(event) => {
              setCreatedByFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All creators</option>
            {(reportersQuery.data ?? []).map((reporter) => (
              <option key={reporter.id} value={reporter.id}>
                {reporter.fullName}
              </option>
            ))}
          </NativeSelect>
        </div>

        {ticketsQuery.isLoading ? (
          <LoadingState message="Loading tickets..." />
        ) : ticketsQuery.isError ? (
          <p className="text-sm text-destructive">Failed to load tickets.</p>
        ) : (
          <DataTable
            columns={columns}
            data={tickets}
            emptyState={
              hasActiveFilters
                ? {
                    icon: SearchX,
                    title: 'No tickets match your filters',
                    description:
                      'Try adjusting the search keyword or filter options to find what you are looking for.',
                    action: (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('ALL');
                          setPriorityFilter('ALL');
                          setTypeFilter('ALL');
                          setCreatedByFilter('ALL');
                          setProjectFilter('ALL');
                          setSprintFilter('ALL');
                          setPage(1);
                        }}
                      >
                        Clear filters
                      </Button>
                    ),
                  }
                : {
                    icon: TicketIcon,
                    title: 'No tickets yet',
                    description:
                      'Create your first service desk request to report bugs, request enhancements, or ask for support.',
                    action: (
                      <Button size="sm" onClick={() => setDialogOpen(true)}>
                        <Plus className="size-4" />
                        Create ticket
                      </Button>
                    ),
                  }
            }
          />
        )}

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
      </div>

      <TicketFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />
    </>
  );
}
