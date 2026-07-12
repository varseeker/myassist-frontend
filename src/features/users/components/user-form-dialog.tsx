'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
  telegramDeepLinkPrefix?: string | null;
  onSubmit: (
    values: CreateUserFormValues | UpdateUserFormValues,
  ) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  telegramDeepLinkPrefix,
  onSubmit,
}: UserFormDialogProps) {
  const isEdit = mode === 'edit';
  const [createProjectIds, setCreateProjectIds] = useState<string[]>([]);
  const [editProjectIds, setEditProjectIds] = useState<string[]>([]);

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema as never),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'USER',
      phoneNumber: '',
      whatsappEnabled: true,
      telegramChatId: '',
      telegramEnabled: true,
    },
  });

  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema as never),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      role: 'USER',
      isActive: true,
      password: '',
      phoneNumber: '',
      whatsappEnabled: true,
      telegramChatId: '',
      telegramEnabled: true,
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
        username: user.username,
        email: user.email ?? '',
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        password: '',
        phoneNumber: user.phoneNumber ?? '',
        whatsappEnabled: user.whatsappEnabled ?? true,
        telegramChatId: user.telegramChatId ?? '',
        telegramEnabled: user.telegramEnabled ?? true,
      });
      setEditProjectIds(user.projects?.map((project) => project.id) ?? []);
      return;
    }

    createForm.reset({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'USER',
      phoneNumber: '',
      whatsappEnabled: true,
      telegramChatId: '',
      telegramEnabled: true,
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
      email: values.email?.trim()
        ? values.email.trim()
        : isEdit
          ? ''
          : undefined,
      phoneNumber: values.phoneNumber?.trim()
        ? values.phoneNumber.trim()
        : isEdit
          ? null
          : undefined,
      telegramChatId: values.telegramChatId?.trim()
        ? values.telegramChatId.trim()
        : isEdit
          ? null
          : undefined,
      projectIds: values.role === 'ADMIN' ? [] : projectIds,
    } as CreateUserFormValues | UpdateUserFormValues);
    onOpenChange(false);
  };

  const telegramLink =
    isEdit && user?.telegramLinkToken && telegramDeepLinkPrefix
      ? `${telegramDeepLinkPrefix}${user.telegramLinkToken}`
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <LoadingOverlay
          visible={
            createForm.formState.isSubmitting || editForm.formState.isSubmitting
          }
        />
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update profile, messaging contacts, role, or status.'
              : 'Add a new user to MyAssist.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          <form
            onSubmit={editForm.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Field
              label="Email (optional)"
              error={editForm.formState.errors.email?.message}
            >
              <Input
                type="email"
                placeholder="name@example.com"
                {...editForm.register('email')}
              />
            </Field>

            <Field
              label="Username"
              error={editForm.formState.errors.username?.message}
            >
              <Input
                autoComplete="username"
                placeholder="johndoe"
                {...editForm.register('username')}
              />
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
              label="WhatsApp phone"
              error={editForm.formState.errors.phoneNumber?.message}
            >
              <Input
                placeholder="0812... or +62812..."
                {...editForm.register('phoneNumber')}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...editForm.register('whatsappEnabled')} />
              WhatsApp notifications enabled
            </label>

            <Field
              label="Telegram chat ID"
              error={editForm.formState.errors.telegramChatId?.message}
            >
              <Input
                placeholder="Filled via bot link, or paste manually"
                {...editForm.register('telegramChatId')}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...editForm.register('telegramEnabled')} />
              Telegram notifications enabled
            </label>

            {telegramLink ? (
              <div className="space-y-2 rounded-md border p-3 text-xs">
                <p className="font-medium">Telegram link for this user</p>
                <p className="break-all text-muted-foreground">{telegramLink}</p>
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(telegramLink);
                    toast.success('Telegram link copied');
                  }}
                >
                  Copy link
                </button>
              </div>
            ) : null}

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
            <Field
              label="Username"
              error={createForm.formState.errors.username?.message}
            >
              <Input
                autoComplete="username"
                placeholder="johndoe"
                {...createForm.register('username')}
              />
            </Field>

            <Field
              label="Email (optional)"
              error={createForm.formState.errors.email?.message}
            >
              <Input
                type="email"
                placeholder="name@example.com"
                {...createForm.register('email')}
              />
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

            <Field
              label="WhatsApp phone (optional)"
              error={createForm.formState.errors.phoneNumber?.message}
            >
              <Input
                placeholder="0812... or +62812..."
                {...createForm.register('phoneNumber')}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...createForm.register('whatsappEnabled')}
              />
              WhatsApp notifications enabled
            </label>

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
