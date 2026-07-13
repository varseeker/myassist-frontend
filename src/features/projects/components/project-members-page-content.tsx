'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserMinus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { useAuthStore } from '@/features/auth/store';
import {
  assignProjectMemberRequest,
  getAssignableUsersRequest,
  getProjectMembersListRequest,
  getProjectsRequest,
  removeProjectMemberRequest,
} from '@/features/projects/api';
import type { User } from '@/types';

export function ProjectMembersPageContent() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [projectId, setProjectId] = useState('');
  const [search, setSearch] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<Pick<
    User,
    'id' | 'fullName'
  > | null>(null);

  const projectsQuery = useQuery({
    queryKey: ['project-members-projects'],
    queryFn: () =>
      getProjectsRequest({ page: 1, limit: 100, isActive: true }),
  });

  const membersQuery = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => getProjectMembersListRequest(projectId),
    enabled: Boolean(projectId),
  });

  const assignableQuery = useQuery({
    queryKey: ['project-assignable-users', projectId, search],
    queryFn: () => getAssignableUsersRequest(projectId, search || undefined),
    enabled: Boolean(projectId),
  });

  const refreshMembership = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-members', projectId],
    });
    await queryClient.invalidateQueries({
      queryKey: ['project-assignable-users', projectId],
    });
    await queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const assignMutation = useMutation({
    mutationFn: (userId: string) =>
      assignProjectMemberRequest(projectId, userId),
    onSuccess: async (result) => {
      toast.success(result.message);
      await refreshMembership();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      removeProjectMemberRequest(projectId, userId),
    onSuccess: async (result) => {
      toast.success(result.message);
      await refreshMembership();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Project Members
        </h1>
        <p className="text-sm text-muted-foreground">
          Assign user ke project yang Anda kelola. USER yang baru register
          biasanya belum punya project.
        </p>
      </div>

      <NativeSelect
        value={projectId}
        onChange={(event) => setProjectId(event.target.value)}
      >
        <option value="">Select project...</option>
        {(projectsQuery.data?.items ?? []).map((project) => (
          <option key={project.id} value={project.id}>
            {project.code} — {project.name}
          </option>
        ))}
      </NativeSelect>

      {!projectId ? (
        <p className="text-sm text-muted-foreground">
          Pilih project untuk mengelola anggota.
        </p>
      ) : membersQuery.isLoading || assignableQuery.isLoading ? (
        <LoadingState message="Loading members..." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(membersQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada anggota di project ini.
                </p>
              ) : (
                (membersQuery.data ?? []).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{member.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        @{member.username}
                        {member.email ? ` · ${member.email}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{member.role}</Badge>
                      {member.id !== user?.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={removeMutation.isPending}
                          onClick={() =>
                            setConfirmRemove({
                              id: member.id,
                              fullName: member.fullName,
                            })
                          }
                        >
                          <UserMinus className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="text-base">Assign user</CardTitle>
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              {(assignableQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada user yang bisa di-assign.
                </p>
              ) : (
                (assignableQuery.data ?? []).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {candidate.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{candidate.username}
                        {candidate.email ? ` · ${candidate.email}` : ''}
                        {candidate.projectCount === 0
                          ? ' · belum punya project'
                          : ` · ${candidate.projectCount} project`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{candidate.role}</Badge>
                      <LoadingButton
                        size="sm"
                        loading={assignMutation.isPending}
                        loadingText="..."
                        onClick={() =>
                          void assignMutation.mutateAsync(candidate.id)
                        }
                      >
                        <UserPlus className="size-4" />
                        Assign
                      </LoadingButton>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        onOpenChange={(open) => {
          if (!open) setConfirmRemove(null);
        }}
        title="Remove member?"
        description={
          confirmRemove
            ? `Hapus ${confirmRemove.fullName} dari project?`
            : ''
        }
        confirmLabel="Remove"
        loading={removeMutation.isPending}
        onConfirm={async () => {
          if (!confirmRemove) return;
          await removeMutation.mutateAsync(confirmRemove.id);
          setConfirmRemove(null);
        }}
      />
    </div>
  );
}
