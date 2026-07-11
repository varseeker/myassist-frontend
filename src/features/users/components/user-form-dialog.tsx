'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingOverlay } from '@/components/shared/loading-overlay';
import { UserProjectField } from '@/features/users/components/user-project-field';
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
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from '@/features/users/schemas';
import { USER_ROLES } from '@/lib/constants';
import type { User } from '@/types';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: User | null;
  onSubmit: (
    values: CreateUserFormValues | UpdateUserFormValues,
  ) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  onSubmit,
}: UserFormDialogProps) {
  const isEdit = mode === 'edit';
  const [createProjectIds, setCreateProjectIds] = useState<string[]>([]);
  const [editProjectIds, setEditProjectIds] = useState<string[]>([]);

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema as never),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'USER',
    },
  });

  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema as never),
    defaultValues: {
      fullName: '',
      role: 'USER',
      isActive: true,
      password: '',
    },
  });

  const createRole = createForm.watch('role');
  const editRole = editForm.watch('role');
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasInitializedRef.current = false;
      return;
    }

    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    if (isEdit && user) {
      editForm.reset({
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        password: '',
      });
      setEditProjectIds(user.projects?.map((project) => project.id) ?? []);
      return;
    }

    createForm.reset({
      email: '',
      password: '',
      fullName: '',
      role: 'USER',
    });
    setCreateProjectIds([]);
    setEditProjectIds([]);
  }, [open, isEdit, user, createForm, editForm]);

  const handleSubmit = async (
    values: CreateUserFormValues | UpdateUserFormValues,
  ) => {
    const projectIds = isEdit ? editProjectIds : createProjectIds;
    await onSubmit({
      ...values,
      projectIds: values.role === 'ADMIN' ? [] : projectIds,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <LoadingOverlay
          visible={
            createForm.formState.isSubmitting || editForm.formState.isSubmitting
          }
        />
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update user profile, role, or status.'
              : 'Add a new user to MyAssist.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          <form
            onSubmit={editForm.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Field label="Email">
              <Input value={user?.email ?? ''} disabled />
            </Field>

            <Field label="Full Name" error={editForm.formState.errors.fullName?.message}>
              <Input {...editForm.register('fullName')} />
            </Field>

            <Field label="Role" error={editForm.formState.errors.role?.message}>
              <NativeSelect {...editForm.register('role')}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label="Status">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...editForm.register('isActive')} />
                Active account
              </label>
            </Field>

            <Field
              label="New Password (optional)"
              error={editForm.formState.errors.password?.message}
            >
              <Input
                type="password"
                placeholder="Leave blank to keep current"
                {...editForm.register('password')}
              />
            </Field>

            <UserProjectField
              role={editRole}
              value={editProjectIds}
              onChange={setEditProjectIds}
              enabled={open}
            />

            <LoadingButton
              type="submit"
              className="w-full"
              loading={editForm.formState.isSubmitting}
              loadingText="Saving..."
            >
              Save Changes
            </LoadingButton>
          </form>
        ) : (
          <form
            onSubmit={createForm.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Field label="Email" error={createForm.formState.errors.email?.message}>
              <Input type="email" {...createForm.register('email')} />
            </Field>

            <Field
              label="Full Name"
              error={createForm.formState.errors.fullName?.message}
            >
              <Input {...createForm.register('fullName')} />
            </Field>

            <Field label="Role" error={createForm.formState.errors.role?.message}>
              <NativeSelect {...createForm.register('role')}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field
              label="Password"
              error={createForm.formState.errors.password?.message}
            >
              <Input type="password" {...createForm.register('password')} />
            </Field>

            <UserProjectField
              role={createRole}
              value={createProjectIds}
              onChange={setCreateProjectIds}
              enabled={open}
            />

            <LoadingButton
              type="submit"
              className="w-full"
              loading={createForm.formState.isSubmitting}
              loadingText="Creating..."
            >
              Create User
            </LoadingButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
