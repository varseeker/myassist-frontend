'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
  getProjectSprintsRequest,
  getProjectsRequest,
} from '@/features/projects/api';
import { exportTicketsBySprintRequest } from '@/features/tickets/api';
import { useAuthStore } from '@/features/auth/store';

export function TicketExportPanel() {
  const userRole = useAuthStore((state) => state.user?.role);
  const canExport =
    userRole === 'ADMIN' || userRole === 'QA' || userRole === 'DEVELOPER';

  const [projectId, setProjectId] = useState('');
  const [sprintId, setSprintId] = useState('');

  const projectsQuery = useQuery({
    queryKey: ['ticket-export-projects'],
    queryFn: () =>
      getProjectsRequest({
        page: 1,
        limit: 100,
        isActive: true,
      }),
    enabled: canExport,
  });

  const sprintsQuery = useQuery({
    queryKey: ['ticket-export-sprints', projectId],
    queryFn: () => getProjectSprintsRequest(projectId),
    enabled: canExport && Boolean(projectId),
  });

  const projects = projectsQuery.data?.items ?? [];
  const sprints = useMemo(
    () => sprintsQuery.data ?? [],
    [sprintsQuery.data],
  );

  const exportMutation = useMutation({
    mutationFn: (format: 'csv' | 'xlsx') =>
      exportTicketsBySprintRequest(sprintId, format),
    onSuccess: (_data, format) => {
      toast.success(
        format === 'xlsx'
          ? 'Export Excel berhasil diunduh'
          : 'Export CSV berhasil diunduh',
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!canExport) {
    return null;
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div>
        <p className="font-medium">Export tickets per sprint</p>
        <p className="text-sm text-muted-foreground">
          Unduh CSV atau Excel berisi project, kode, sprint, tipe, status,
          deskripsi, reporter, assignee, dan last update.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="export-project">Project</Label>
          <NativeSelect
            id="export-project"
            value={projectId}
            onChange={(event) => {
              setProjectId(event.target.value);
              setSprintId('');
            }}
            disabled={projectsQuery.isLoading}
          >
            <option value="">Pilih project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.code} — {project.name}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="export-sprint">Sprint</Label>
          <NativeSelect
            id="export-sprint"
            value={sprintId}
            onChange={(event) => setSprintId(event.target.value)}
            disabled={!projectId || sprintsQuery.isLoading}
          >
            <option value="">Pilih sprint</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
                {sprint.isActive ? ' (Active)' : ''}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2">
          <LoadingButton
            variant="outline"
            disabled={!sprintId}
            loading={exportMutation.isPending && exportMutation.variables === 'csv'}
            loadingText="Exporting..."
            onClick={() => exportMutation.mutate('csv')}
          >
            <Download className="size-3.5" />
            Export CSV
          </LoadingButton>
          <LoadingButton
            variant="outline"
            disabled={!sprintId}
            loading={
              exportMutation.isPending && exportMutation.variables === 'xlsx'
            }
            loadingText="Exporting..."
            onClick={() => exportMutation.mutate('xlsx')}
          >
            <FileSpreadsheet className="size-3.5" />
            Export Excel
          </LoadingButton>
          {!sprintId ? (
            <Button variant="ghost" size="sm" disabled>
              Pilih sprint dulu
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
