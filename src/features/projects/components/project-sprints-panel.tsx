'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
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
import { exportTicketsBySprintRequest } from '@/features/tickets/api';
import {
  dateInputToIso,
  SprintTimeline,
  toDateInputValue,
} from '@/features/projects/components/sprint-timeline';
import { cn } from '@/lib/utils';
import type { Project, Sprint } from '@/types';

interface ProjectSprintsPanelProps {
  project: Project;
}

interface SprintFormState {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const EMPTY_FORM: SprintFormState = {
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  isActive: false,
};

function sprintToForm(sprint: Sprint): SprintFormState {
  return {
    name: sprint.name,
    goal: sprint.goal ?? '',
    startDate: toDateInputValue(sprint.startDate),
    endDate: toDateInputValue(sprint.endDate),
    isActive: sprint.isActive,
  };
}

export function ProjectSprintsPanel({ project }: ProjectSprintsPanelProps) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<SprintFormState>({
    ...EMPTY_FORM,
    isActive: true,
  });
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SprintFormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<Sprint | null>(null);

  const sprintsQuery = useQuery({
    queryKey: ['project-sprints', project.id],
    queryFn: () => getProjectSprintsRequest(project.id),
  });

  const invalidateSprints = () => {
    void queryClient.invalidateQueries({ queryKey: ['project-sprints', project.id] });
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
    void queryClient.invalidateQueries({ queryKey: ['ticket-form-sprints'] });
    void queryClient.invalidateQueries({ queryKey: ['ticket-triage-sprints'] });
  };

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
      setCreateForm({ ...EMPTY_FORM, isActive: true });
      invalidateSprints();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      sprintId,
      payload,
    }: {
      sprintId: string;
      payload: {
        name?: string;
        goal?: string;
        startDate?: string;
        endDate?: string;
        isActive?: boolean;
      };
    }) => updateSprintRequest(project.id, sprintId, payload),
    onSuccess: () => {
      toast.success('Sprint updated');
      setEditingSprintId(null);
      invalidateSprints();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (sprintId: string) => deleteSprintRequest(project.id, sprintId),
    onSuccess: () => {
      toast.success('Sprint deleted');
      invalidateSprints();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const exportMutation = useMutation({
    mutationFn: ({
      sprintId,
      format,
    }: {
      sprintId: string;
      format: 'csv' | 'xlsx';
    }) => exportTicketsBySprintRequest(sprintId, format),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.format === 'xlsx'
          ? 'Export Excel berhasil diunduh'
          : 'Export CSV berhasil diunduh',
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sprints = sprintsQuery.data ?? [];

  const startEdit = (sprint: Sprint) => {
    setEditingSprintId(sprint.id);
    setEditForm(sprintToForm(sprint));
  };

  const cancelEdit = () => {
    setEditingSprintId(null);
    setEditForm(EMPTY_FORM);
  };

  const saveEdit = (sprintId: string) => {
    if (!editForm.name.trim() || !editForm.startDate || !editForm.endDate) {
      toast.error('Name, start date, and end date are required');
      return;
    }

    updateMutation.mutate({
      sprintId,
      payload: {
        name: editForm.name.trim(),
        goal: editForm.goal.trim() || undefined,
        startDate: dateInputToIso(editForm.startDate),
        endDate: dateInputToIso(editForm.endDate),
        isActive: editForm.isActive,
      },
    });
  };

  const toggleActive = (sprint: Sprint) => {
    updateMutation.mutate({
      sprintId: sprint.id,
      payload: { isActive: !sprint.isActive },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Sprints</CardTitle>
          <CardDescription>
            Manage sprint timeline and active status. Only one sprint can be active
            at a time per project.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="size-3.5" />
          New sprint
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreate ? (
          <SprintFormFields
            form={createForm}
            onChange={setCreateForm}
            footer={
              <div className="flex gap-2 sm:col-span-2">
                <LoadingButton
                  loading={createMutation.isPending}
                  loadingText="Creating..."
                  onClick={() =>
                    createMutation.mutate({
                      name: createForm.name,
                      goal: createForm.goal || undefined,
                      startDate: dateInputToIso(createForm.startDate),
                      endDate: dateInputToIso(createForm.endDate),
                      isActive: createForm.isActive,
                    })
                  }
                >
                  Create sprint
                </LoadingButton>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            }
          />
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
            {sprints.map((sprint) => {
              const isEditing = editingSprintId === sprint.id;

              return (
                <div
                  key={sprint.id}
                  className="rounded-lg border p-4"
                >
                  {isEditing ? (
                    <SprintFormFields
                      form={editForm}
                      onChange={setEditForm}
                      footer={
                        <div className="flex gap-2 sm:col-span-2">
                          <LoadingButton
                            loading={updateMutation.isPending}
                            loadingText="Saving..."
                            onClick={() => saveEdit(sprint.id)}
                          >
                            Save changes
                          </LoadingButton>
                          <Button variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      }
                    />
                  ) : (
                    <>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{sprint.name}</p>
                            {sprint.isActive ? (
                              <Badge>Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>

                          <SprintTimeline
                            startDate={sprint.startDate}
                            endDate={sprint.endDate}
                          />

                          {sprint.goal ? (
                            <p className="text-sm text-muted-foreground">{sprint.goal}</p>
                          ) : null}

                          <p className="text-xs text-muted-foreground">
                            Last updated {new Date(sprint.updatedAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(sprint)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={exportMutation.isPending}
                            onClick={() =>
                              exportMutation.mutate({
                                sprintId: sprint.id,
                                format: 'csv',
                              })
                            }
                          >
                            <Download className="size-3.5" />
                            CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={exportMutation.isPending}
                            onClick={() =>
                              exportMutation.mutate({
                                sprintId: sprint.id,
                                format: 'xlsx',
                              })
                            }
                          >
                            <FileSpreadsheet className="size-3.5" />
                            Excel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updateMutation.isPending}
                            onClick={() => toggleActive(sprint)}
                          >
                            {sprint.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deleteMutation.isPending}
                            onClick={() => setConfirmDelete(sprint)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
        title="Delete sprint?"
        description={
          confirmDelete ? `Delete sprint ${confirmDelete.name}?` : ''
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteMutation.mutateAsync(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </Card>
  );
}

interface SprintFormFieldsProps {
  form: SprintFormState;
  onChange: (form: SprintFormState) => void;
  footer: React.ReactNode;
}

function SprintFormFields({ form, onChange, footer }: SprintFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(event) =>
            onChange({ ...form, name: event.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Goal</Label>
        <Input
          value={form.goal}
          onChange={(event) =>
            onChange({ ...form, goal: event.target.value })
          }
          placeholder="Optional sprint goal"
        />
      </div>
      <div className="space-y-2">
        <Label>Start date</Label>
        <Input
          type="date"
          value={form.startDate}
          onChange={(event) =>
            onChange({ ...form, startDate: event.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>End date</Label>
        <Input
          type="date"
          value={form.endDate}
          onChange={(event) =>
            onChange({ ...form, endDate: event.target.value })
          }
        />
      </div>

      {form.startDate && form.endDate ? (
        <div className="sm:col-span-2">
          <SprintTimeline
            startDate={dateInputToIso(form.startDate)}
            endDate={dateInputToIso(form.endDate)}
          />
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <label
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5',
            form.isActive && 'border-primary/40 bg-primary/5',
          )}
        >
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              onChange({ ...form, isActive: event.target.checked })
            }
            className="size-4 rounded border-input"
          />
          <div>
            <p className="text-sm font-medium">Active sprint</p>
            <p className="text-xs text-muted-foreground">
              Activating this sprint will deactivate other sprints in the project.
            </p>
          </div>
        </label>
      </div>

      {footer}
    </div>
  );
}
