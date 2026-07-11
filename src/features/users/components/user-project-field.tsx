'use client';

import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { getProjectsRequest } from '@/features/projects/api';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface UserProjectFieldProps {
  role: UserRole;
  value: string[];
  onChange: (projectIds: string[]) => void;
  error?: string;
  enabled?: boolean;
}

export function UserProjectField({
  role,
  value,
  onChange,
  error,
  enabled = true,
}: UserProjectFieldProps) {
  const projectsQuery = useQuery({
    queryKey: ['projects', 'user-form'],
    queryFn: () => getProjectsRequest({ page: 1, limit: 100, isActive: true }),
    enabled,
  });

  const projects = projectsQuery.data?.items ?? [];

  if (role === 'ADMIN') {
    return (
      <p className="text-sm text-muted-foreground">
        Admin accounts are not tied to a specific project.
      </p>
    );
  }

  const isSingleSelect = role === 'USER';

  return (
    <div className="space-y-2">
      <Label>
        {isSingleSelect ? 'Project' : 'Projects'}
        {role === 'QA' || role === 'DEVELOPER' ? ' (multi-select)' : ''}
      </Label>
      {projectsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      ) : projectsQuery.isError ? (
        <p className="text-sm text-destructive">
          Failed to load projects. Save the user after projects are available.
        </p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No active projects found. Create a project first from the Projects menu.
        </p>
      ) : (
        <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3">
          {projects.map((project) => {
            const checked = value.includes(project.id);
            return (
              <label
                key={project.id}
                className="flex cursor-pointer items-start gap-2 text-sm"
              >
                <input
                  type={isSingleSelect ? 'radio' : 'checkbox'}
                  name="user-project"
                  checked={checked}
                  onChange={() => {
                    if (isSingleSelect) {
                      onChange([project.id]);
                      return;
                    }

                    onChange(
                      checked
                        ? value.filter((id) => id !== project.id)
                        : [...value, project.id],
                    );
                  }}
                />
                <span>
                  <span className="font-medium">{project.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {project.code}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className={cn('text-xs text-muted-foreground')}>
        {role === 'USER'
          ? 'Each user account must belong to exactly one active project.'
          : 'QA and Developer accounts can be assigned to multiple projects.'}
      </p>
    </div>
  );
}
