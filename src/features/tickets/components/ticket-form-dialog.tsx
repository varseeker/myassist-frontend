'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingOverlay } from '@/components/shared/loading-overlay';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { useAuthStore } from '@/features/auth/store';
import { getProjectSprintsRequest, getProjectsRequest } from '@/features/projects/api';
import {
  ACCEPTED_TICKET_IMAGE_TYPES,
  MAX_TICKET_IMAGES,
  staffCreateTicketSchema,
  USER_TICKET_DESCRIPTION_PLACEHOLDER,
  userCreateTicketSchema,
  type CreateTicketSubmitPayload,
  type StaffCreateTicketFormValues,
  type UserCreateTicketFormValues,
} from '@/features/tickets/schemas';
import { MAX_ATTACHMENT_SIZE_BYTES } from '@/features/tickets/api';
import {
  TICKET_PRIORITIES,
  TICKET_TYPE_LABELS,
  TICKET_TYPES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { UserProjectSummary } from '@/types';

const EMPTY_PROJECTS: UserProjectSummary[] = [];

interface TicketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateTicketSubmitPayload) => Promise<void>;
  isSubmitting?: boolean;
}

type StaffFormValues = StaffCreateTicketFormValues;
type UserFormValues = UserCreateTicketFormValues;

export function TicketFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: TicketFormDialogProps) {
  const user = useAuthStore((state) => state.user);
  const userProjects = user?.projects ?? EMPTY_PROJECTS;
  const isRegularUser = user?.role === 'USER';
  const isQa = user?.role === 'QA';
  const isAdmin = user?.role === 'ADMIN';

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allProjectsQuery = useQuery({
    queryKey: ['projects', 'ticket-form'],
    queryFn: () => getProjectsRequest({ page: 1, limit: 100, isActive: true }),
    enabled: open && isAdmin,
  });

  const availableProjects = useMemo(() => {
    if (isAdmin) {
      return allProjectsQuery.data?.items ?? EMPTY_PROJECTS;
    }

    if (isQa) {
      return userProjects.filter((project) => project.isActive);
    }

    return userProjects;
  }, [isAdmin, isQa, allProjectsQuery.data?.items, userProjects]);

  const isSingleProjectUser = isRegularUser && availableProjects.length === 1;

  const staffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffCreateTicketSchema as never),
    defaultValues: {
      title: '',
      description: '',
      type: 'BUG_REPORT',
      priority: 'MEDIUM',
      projectId: availableProjects[0]?.id,
      sprintId: '',
    },
  });

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userCreateTicketSchema as never),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const titleRegister = isRegularUser
    ? userForm.register('title')
    : staffForm.register('title');
  const descriptionRegister = isRegularUser
    ? userForm.register('description')
    : staffForm.register('description');
  const formErrors = isRegularUser
    ? userForm.formState.errors
    : staffForm.formState.errors;
  const selectedProjectId = isRegularUser
    ? availableProjects[0]?.id
    : staffForm.watch('projectId');

  const sprintsQuery = useQuery({
    queryKey: ['ticket-form-sprints', selectedProjectId],
    queryFn: () => getProjectSprintsRequest(selectedProjectId!, true),
    enabled: open && !isRegularUser && Boolean(selectedProjectId),
  });

  const defaultProjectId = availableProjects[0]?.id ?? '';
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasInitializedRef.current = false;
      setImages([]);
      setImagePreviews((current) => {
        current.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      return;
    }

    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    if (isRegularUser) {
      userForm.reset({
        title: '',
        description: '',
      });
      return;
    }

    staffForm.reset({
      title: '',
      description: '',
      type: 'BUG_REPORT',
      priority: 'MEDIUM',
      projectId: defaultProjectId,
      sprintId: '',
    });
  }, [open, defaultProjectId, isRegularUser, userForm, staffForm]);

  useEffect(() => {
    if (!open || isRegularUser || !defaultProjectId) {
      return;
    }

    if (!staffForm.getValues('projectId')) {
      staffForm.setValue('projectId', defaultProjectId, { shouldDirty: false });
    }
  }, [open, defaultProjectId, isRegularUser, staffForm]);

  useEffect(() => {
    if (!open || isRegularUser) {
      return;
    }

    const activeSprint = sprintsQuery.data?.find((sprint) => sprint.isActive);
    if (!activeSprint) {
      return;
    }

    if (staffForm.getValues('sprintId') !== activeSprint.id) {
      staffForm.setValue('sprintId', activeSprint.id, { shouldDirty: false });
    }
  }, [open, isRegularUser, sprintsQuery.data, staffForm]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!selected.length) {
      return;
    }

    const remainingSlots = MAX_TICKET_IMAGES - images.length;
    if (remainingSlots <= 0) {
      return;
    }

    const nextFiles = selected.slice(0, remainingSlots).filter((file) => {
      if (!file.type.startsWith('image/')) {
        return false;
      }

      return file.size <= MAX_ATTACHMENT_SIZE_BYTES;
    });

    if (!nextFiles.length) {
      return;
    }

    setImages((current) => [...current, ...nextFiles]);
    setImagePreviews((current) => [
      ...current,
      ...nextFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setImagePreviews((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed);
      }
      return next;
    });
  };

  const handleSubmit = isRegularUser
    ? userForm.handleSubmit(async (values) => {
        await onSubmit({ values, images });
        userForm.reset();
        setImages([]);
        setImagePreviews((current) => {
          current.forEach((url) => URL.revokeObjectURL(url));
          return [];
        });
        onOpenChange(false);
      })
    : staffForm.handleSubmit(async (values) => {
        await onSubmit({ values, images });
        staffForm.reset();
        setImages([]);
        setImagePreviews((current) => {
          current.forEach((url) => URL.revokeObjectURL(url));
          return [];
        });
        onOpenChange(false);
      });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <LoadingOverlay visible={!!isSubmitting} />
        <DialogHeader>
          <DialogTitle>Create Ticket</DialogTitle>
          <DialogDescription>
            {isRegularUser
              ? 'Submit your issue with a title, description, and supporting screenshots. QA will review and assign the sprint.'
              : 'Ticket will be linked to your project and the selected active sprint.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isRegularUser ? (
            <>
              {isSingleProjectUser ? (
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <p className="font-medium">{availableProjects[0]?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {availableProjects[0]?.code}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project</Label>
                  <NativeSelect
                    id="projectId"
                    {...staffForm.register('projectId')}
                  >
                    <option value="">Select project</option>
                    {availableProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sprintId">Sprint</Label>
                <NativeSelect
                  id="sprintId"
                  {...staffForm.register('sprintId')}
                  disabled={!selectedProjectId || sprintsQuery.isLoading}
                >
                  <option value="">Select sprint</option>
                  {(sprintsQuery.data ?? []).map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                      {sprint.isActive ? ' (Active)' : ''}
                    </option>
                  ))}
                </NativeSelect>
                {staffForm.formState.errors.sprintId ? (
                  <p className="text-xs text-destructive">
                    {staffForm.formState.errors.sprintId.message}
                  </p>
                ) : null}
                {selectedProjectId &&
                !sprintsQuery.isLoading &&
                !sprintsQuery.data?.length ? (
                  <p className="text-xs text-muted-foreground">
                    No active sprint found. Ask admin to activate a sprint for
                    this project.
                  </p>
                ) : null}
              </div>
            </>
          ) : isSingleProjectUser ? (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <p className="font-medium">{availableProjects[0]?.name}</p>
              <p className="text-xs text-muted-foreground">
                {availableProjects[0]?.code}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...titleRegister} />
            {formErrors.title ? (
              <p className="text-xs text-destructive">
                {formErrors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={isRegularUser ? 6 : 5}
              placeholder={
                isRegularUser ? USER_TICKET_DESCRIPTION_PLACEHOLDER : undefined
              }
              {...descriptionRegister}
              className={cn(
                'flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />
            {formErrors.description ? (
              <p className="text-xs text-destructive">
                {formErrors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-images">
              {isRegularUser ? 'Screenshots' : 'Attachments (optional)'}
            </Label>
            <input
              ref={fileInputRef}
              id="ticket-images"
              type="file"
              accept={ACCEPTED_TICKET_IMAGE_TYPES}
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div
                  key={preview}
                  className="relative size-20 overflow-hidden rounded-lg border bg-muted/30"
                >
                  <Image
                    src={preview}
                    alt={`Upload preview ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-background/90 p-0.5 shadow-sm"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {images.length < MAX_TICKET_IMAGES ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <ImagePlus className="size-4" />
                  Add
                </button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Up to {MAX_TICKET_IMAGES} images, max 10 MB each (JPEG, PNG, GIF,
              WebP).
            </p>
          </div>

          {!isRegularUser ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <NativeSelect id="type" {...staffForm.register('type')}>
                  {TICKET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TICKET_TYPE_LABELS[type]}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <NativeSelect id="priority" {...staffForm.register('priority')}>
                  {TICKET_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Creating..."
            >
              {isRegularUser ? 'Submit Ticket' : 'Create Ticket'}
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
