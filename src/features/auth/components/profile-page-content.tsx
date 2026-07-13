'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, Unlink } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getProfileRequest,
  updateProfileRequest,
  updateProfileSchema,
  useAuthStore,
  type UpdateProfileFormValues,
} from '@/features/auth';
import { cn } from '@/lib/utils';

export function ProfilePageContent() {
  const setUser = useAuthStore((state) => state.setUser);

  const profileQuery = useQuery({
    queryKey: ['my-profile'],
    queryFn: getProfileRequest,
  });

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema as never),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      whatsappEnabled: true,
      telegramChatId: '',
      telegramEnabled: true,
    },
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    form.reset({
      username: profile.username,
      email: profile.email ?? '',
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber ?? '',
      whatsappEnabled: profile.whatsappEnabled ?? true,
      telegramChatId: profile.telegramChatId ?? '',
      telegramEnabled: profile.telegramEnabled ?? true,
    });
    setUser(profile);
  }, [profileQuery.data, form, setUser]);

  const onSubmit = async (values: UpdateProfileFormValues) => {
    try {
      const updated = await updateProfileRequest({
        username: values.username,
        email: values.email.trim() === '' ? null : values.email.trim(),
        fullName: values.fullName,
        phoneNumber:
          values.phoneNumber?.trim() === ''
            ? null
            : values.phoneNumber?.trim() || null,
        whatsappEnabled: values.whatsappEnabled,
        telegramChatId:
          values.telegramChatId?.trim() === ''
            ? null
            : values.telegramChatId?.trim() || null,
        telegramEnabled: values.telegramEnabled,
      });
      setUser(updated);
      toast.success('Profile updated');
      await profileQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    }
  };

  if (profileQuery.isLoading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <p className="text-sm text-destructive">Failed to load profile.</p>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Kelola data akun dan integrasi notifikasi WhatsApp / Telegram.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...form.register('fullName')} />
              {form.formState.errors.fullName ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...form.register('username')} />
              {form.formState.errors.username ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.username.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">No. WhatsApp</Label>
              <Input
                id="phoneNumber"
                placeholder="081234567890"
                {...form.register('phoneNumber')}
              />
              <p className="text-xs text-muted-foreground">
                Format 08... atau +62.... Digunakan untuk notifikasi WhatsApp.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register('whatsappEnabled')} />
              Aktifkan notifikasi WhatsApp
            </label>

            <LoadingButton
              type="submit"
              loading={form.formState.isSubmitting}
              loadingText="Saving..."
            >
              Save profile
            </LoadingButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">Telegram integration</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hubungkan chat ID Telegram agar notifikasi tiket masuk ke bot.
            </p>
          </div>
          <Badge variant={profile.telegramLinked ? 'default' : 'outline'}>
            {profile.telegramLinked ? 'Connected' : 'Not connected'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.telegramLinked ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium">Telegram sudah tertaut</p>
                <p className="text-muted-foreground">
                  Chat ID: {profile.telegramChatId}
                </p>
              </div>
            </div>
          ) : null}

          {profile.telegramDeepLink ? (
            <div className="space-y-2">
              <p className="text-sm">
                Cara cepat: buka bot Telegram, lalu tekan <strong>Start</strong>.
              </p>
              <a
                href={profile.telegramDeepLink}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants())}
              >
                <ExternalLink className="size-4" />
                Hubungkan Telegram
              </a>
            </div>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-200">
              Bot Telegram belum dikonfigurasi di server. Hubungi admin.
            </p>
          )}

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 border-t pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="telegramChatId">
                Atau isi manual Telegram chat / user ID
              </Label>
              <Input
                id="telegramChatId"
                placeholder="Contoh: 123456789"
                {...form.register('telegramChatId')}
              />
              <p className="text-xs text-muted-foreground">
                Chat ID bisa dilihat dari bot @userinfobot, atau otomatis terisi
                setelah Anda tekan Start lewat tombol di atas.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register('telegramEnabled')} />
              Aktifkan notifikasi Telegram
            </label>

            <div className="flex flex-wrap gap-2">
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                loadingText="Saving..."
              >
                Simpan Telegram ID
              </LoadingButton>
              {profile.telegramLinked ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void (async () => {
                      try {
                        const updated = await updateProfileRequest({
                          telegramChatId: null,
                        });
                        setUser(updated);
                        form.setValue('telegramChatId', '');
                        toast.success('Telegram disconnected');
                        await profileQuery.refetch();
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Failed to disconnect',
                        );
                      }
                    })();
                  }}
                >
                  <Unlink className="size-4" />
                  Putuskan tautan
                </Button>
              ) : null}
            </div>
          </form>

          {profile.telegramLinkToken ? (
            <p className="text-xs text-muted-foreground">
              Token link: <code>{profile.telegramLinkToken}</code> — bisa dikirim
              ke bot dengan <code>/link {profile.telegramLinkToken}</code>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
