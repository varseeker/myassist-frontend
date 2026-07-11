'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, SearchX, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/shared/data-table';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { RoleBadge } from '@/features/users/components/role-badge';
import { UserFormDialog } from '@/features/users/components/user-form-dialog';
import {
  createUserRequest,
  deleteUserRequest,
  getUsersRequest,
  updateUserRequest,
} from '@/features/users/api';
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from '@/features/users/schemas';
import { USER_ROLES } from '@/lib/constants';
import type { User, UserRole } from '@/types';

export function UsersPageContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const usersQuery = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () =>
      getUsersRequest({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const createMutation = useMutation({
    mutationFn: createUserRequest,
    onSuccess: () => {
      toast.success('User created successfully');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserFormValues;
    }) =>
      updateUserRequest(id, {
        ...payload,
        password: payload.password || undefined,
      }),
    onSuccess: () => {
      toast.success('User updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: () => {
      toast.success('User deleted successfully');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        id: 'projects',
        header: 'Projects',
        cell: ({ row }) => {
          const projects = row.original.projects ?? [];
          if (row.original.role === 'ADMIN') {
            return <span className="text-xs text-muted-foreground">All projects</span>;
          }
          if (projects.length === 0) {
            return <span className="text-xs text-muted-foreground">Unassigned</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {projects.map((project) => (
                <Badge key={project.id} variant="outline" className="text-xs">
                  {project.code}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'outline' : 'secondary'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedUser(row.original);
                setDialogMode('edit');
                setDialogOpen(true);
              }}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    `Delete user ${row.original.fullName}? This cannot be undone.`,
                  )
                ) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation.isPending, deleteMutation],
  );

  const handleFormSubmit = async (
    values: CreateUserFormValues | UpdateUserFormValues,
  ) => {
    if (dialogMode === 'create') {
      await createMutation.mutateAsync(values as CreateUserFormValues);
      return;
    }

    if (!selectedUser) {
      return;
    }

    const payload = values as UpdateUserFormValues;
    await updateMutation.mutateAsync({
      id: selectedUser.id,
      payload: {
        ...payload,
        password: payload.password || undefined,
        projectIds: payload.projectIds,
      },
    });
  };

  const users = usersQuery.data?.items ?? [];
  const meta = usersQuery.data?.meta;
  const hasActiveFilters = Boolean(search) || roleFilter !== 'ALL';

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage user accounts, project assignments, and role access.
            </p>
          </div>
          <Button
            onClick={() => {
              setDialogMode('create');
              setSelectedUser(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add User
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="sm:max-w-xs"
          />
          <NativeSelect
            containerClassName="sm:w-auto"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as UserRole | 'ALL');
              setPage(1);
            }}
          >
            <option value="ALL">All roles</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </NativeSelect>
        </div>

        {usersQuery.isLoading ? (
          <LoadingState message="Loading users..." />
        ) : usersQuery.isError ? (
          <ErrorState
            title="Failed to load users"
            description="We could not fetch the user list from the server."
            error={usersQuery.error}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void usersQuery.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            emptyState={
              hasActiveFilters
                ? {
                    icon: SearchX,
                    title: 'No users match your search',
                    description:
                      'Try a different name, email keyword, or role filter.',
                    action: (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch('');
                          setRoleFilter('ALL');
                          setPage(1);
                        }}
                      >
                        Clear filters
                      </Button>
                    ),
                  }
                : {
                    icon: Users,
                    title: 'No users in the system',
                    description:
                      'Add team members so they can submit tickets and collaborate on the service desk.',
                    action: (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedUser(null);
                          setDialogMode('create');
                          setDialogOpen(true);
                        }}
                      >
                        <Plus className="size-4" />
                        Add user
                      </Button>
                    ),
                  }
            }
          />
        )}

        {meta && !usersQuery.isError ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages} ({meta.total} users)
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

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        user={selectedUser}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
