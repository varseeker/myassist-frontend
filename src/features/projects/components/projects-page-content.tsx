'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderKanban, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
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
  createProjectRequest,
  createSprintRequest,
  deleteProjectRequest,
  deleteSprintRequest,
  getProjectSprintsRequest,
  getProjectsRequest,
  updateProjectRequest,
  updateSprintRequest,
} from '@/features/projects/api';
import { ProjectSprintsPanel } from '@/features/projects/components/project-sprints-panel';
import type { Project } from '@/types';

export function ProjectsPageContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  const projectsQuery = useQuery({
    queryKey: ['projects', search],
    queryFn: () =>
      getProjectsRequest({
        page: 1,
        limit: 50,
        search: search || undefined,
      }),
  });

  const projects = projectsQuery.data?.items ?? [];
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const createProjectMutation = useMutation({
    mutationFn: createProjectRequest,
    onSuccess: (project) => {
      toast.success(`Project ${project.name} created`);
      setShowCreateProject(false);
      setProjectForm({ name: '', code: '', description: '' });
      setSelectedProjectId(project.id);
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { isActive?: boolean };
    }) => updateProjectRequest(id, payload),
    onSuccess: () => {
      toast.success('Project updated');
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectRequest,
    onSuccess: () => {
      toast.success('Project deleted');
      setSelectedProjectId(null);
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Maintain active projects and manage their sprints.
            </p>
          </div>
          <Button onClick={() => setShowCreateProject((value) => !value)}>
            <Plus className="size-4" />
            New project
          </Button>
        </div>

        {showCreateProject ? (
          <Card>
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Active projects can receive users, sprints, and tickets.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-code">Code</Label>
                <Input
                  id="project-code"
                  placeholder="MYA-CORE"
                  value={projectForm.code}
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="project-description">Description</Label>
                <textarea
                  id="project-description"
                  rows={3}
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <LoadingButton
                  loading={createProjectMutation.isPending}
                  loadingText="Creating..."
                  onClick={() =>
                    createProjectMutation.mutate({
                      name: projectForm.name,
                      code: projectForm.code,
                      description: projectForm.description || undefined,
                      isActive: true,
                    })
                  }
                >
                  Create project
                </LoadingButton>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />

        {projectsQuery.isLoading ? (
          <LoadingState message="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create an active project first, then add sprints and assign users to it."
            action={
              <Button size="sm" onClick={() => setShowCreateProject(true)}>
                <Plus className="size-4" />
                Create project
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="space-y-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selectedProjectId === project.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.code}</p>
                    </div>
                    <Badge variant={project.isActive ? 'default' : 'outline'}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {project.sprintCount ?? 0} sprints · {project.memberCount ?? 0}{' '}
                    members
                  </p>
                </button>
              ))}
            </div>

            {selectedProject ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle>{selectedProject.name}</CardTitle>
                      <CardDescription>{selectedProject.code}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateProjectMutation.mutate({
                            id: selectedProject.id,
                            payload: { isActive: !selectedProject.isActive },
                          })
                        }
                      >
                        {selectedProject.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteProjectMutation.isPending}
                        onClick={() => setConfirmDelete(selectedProject)}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description || 'No description provided.'}
                    </p>
                  </CardContent>
                </Card>

                <ProjectSprintsPanel project={selectedProject} />
              </div>
            ) : (
              <EmptyState
                compact
                icon={FolderKanban}
                title="Select a project"
                description="Choose a project from the list to manage its sprints."
              />
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
        title="Delete project?"
        description={
          confirmDelete ? `Delete project ${confirmDelete.name}?` : ''
        }
        confirmLabel="Delete"
        loading={deleteProjectMutation.isPending}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteProjectMutation.mutateAsync(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}
