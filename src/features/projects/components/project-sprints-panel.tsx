'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createSprintRequest,
  deleteSprintRequest,
  getProjectSprintsRequest,
  updateSprintRequest,
} from '@/features/projects/api';
import type { Project } from '@/types';

interface ProjectSprintsPanelProps {
  project: Project;
}

export function ProjectSprintsPanel({ project }: ProjectSprintsPanelProps) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const sprintsQuery = useQuery({
    queryKey: ['project-sprints', project.id],
    queryFn: () => getProjectSprintsRequest(project.id),
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      goal?: string;
      startDate: string;
      endDate: string;
      isActive?: boolean;
    }) => createSprintRequest(project.id, payload),
    onSuccess: () => {
      toast.success('Sprint created');
      setShowCreate(false);
      setForm({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        isActive: true,
      });
      void queryClient.invalidateQueries({ queryKey: ['project-sprints', project.id] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      sprintId,
      payload,
    }: {
      sprintId: string;
      payload: { isActive?: boolean };
    }) => updateSprintRequest(project.id, sprintId, payload),
    onSuccess: () => {
      toast.success('Sprint updated');
      void queryClient.invalidateQueries({ queryKey: ['project-sprints', project.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (sprintId: string) => deleteSprintRequest(project.id, sprintId),
    onSuccess: () => {
      toast.success('Sprint deleted');
      void queryClient.invalidateQueries({ queryKey: ['project-sprints', project.id] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sprints = sprintsQuery.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Sprints</CardTitle>
          <CardDescription>
            Each ticket must belong to one sprint within this project.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="size-3.5" />
          New sprint
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreate ? (
          <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Goal</Label>
              <Input
                value={form.goal}
                onChange={(event) =>
                  setForm((current) => ({ ...current, goal: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <LoadingButton
                loading={createMutation.isPending}
                loadingText="Creating..."
                onClick={() =>
                  createMutation.mutate({
                    name: form.name,
                    goal: form.goal || undefined,
                    startDate: new Date(form.startDate).toISOString(),
                    endDate: new Date(form.endDate).toISOString(),
                    isActive: form.isActive,
                  })
                }
              >
                Create sprint
              </LoadingButton>
            </div>
          </div>
        ) : null}

        {sprintsQuery.isLoading ? (
          <LoadingState message="Loading sprints..." className="py-8" />
        ) : sprints.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sprints yet. Create at least one active sprint before users can
            submit tickets.
          </p>
        ) : (
          <div className="space-y-3">
            {sprints.map((sprint) => (
              <div
                key={sprint.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sprint.name}</p>
                    {sprint.isActive ? (
                      <Badge>Active sprint</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(sprint.startDate).toLocaleDateString()} –{' '}
                    {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                  {sprint.goal ? (
                    <p className="mt-2 text-sm text-muted-foreground">{sprint.goal}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  {!sprint.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({
                          sprintId: sprint.id,
                          payload: { isActive: true },
                        })
                      }
                    >
                      Set active
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete sprint ${sprint.name}?`)) {
                        deleteMutation.mutate(sprint.id);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
