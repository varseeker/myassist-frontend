'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, QrCode, RefreshCw, Send } from 'lucide-react';
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
import {
  connectWhatsAppRequest,
  disconnectWhatsAppRequest,
  getMessagingStatusRequest,
  sendMessagingTestRequest,
  type WhatsAppSessionStatus,
} from '@/features/messaging/api';

const STATUS_LABEL: Record<WhatsAppSessionStatus['status'], string> = {
  connected: 'Terhubung',
  connecting: 'Menghubungkan…',
  qr: 'Menunggu scan QR',
  logged_out: 'Sesi logout',
  disconnected: 'Terputus',
  disabled: 'Nonaktif',
};

export function MessagingPageContent() {
  const queryClient = useQueryClient();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['messaging-status'],
    queryFn: getMessagingStatusRequest,
    refetchInterval: (query) => {
      const status = query.state.data?.whatsapp.status;
      return status === 'qr' || status === 'connecting' || status === 'logged_out'
        ? 3000
        : 15000;
    },
  });

  const connectMutation = useMutation({
    mutationFn: (resetSession: boolean) => connectWhatsAppRequest(resetSession),
    onSuccess: (data) => {
      if (data.status === 'qr') {
        toast.success('QR siap discan. Buka WhatsApp di HP lalu tautkan perangkat.');
      } else if (data.status === 'connected') {
        toast.success(`WhatsApp terhubung${data.phoneNumber ? ` (+${data.phoneNumber})` : ''}`);
      } else if (data.status === 'connecting') {
        toast.message('Sedang menghubungkan WhatsApp…');
      } else {
        toast.message(data.hint ?? data.lastError ?? 'Status WhatsApp diperbarui');
      }
      void queryClient.invalidateQueries({ queryKey: ['messaging-status'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Gagal menghubungkan WhatsApp'),
  });

  const disconnectMutation = useMutation({
    mutationFn: (logout: boolean) => disconnectWhatsAppRequest(logout),
    onSuccess: (_data, logout) => {
      toast.success(
        logout
          ? 'Sesi WhatsApp di-logout. Scan QR ulang untuk menghubungkan.'
          : 'WhatsApp diputus sementara. Klik Hubungkan untuk menyambung ulang.',
      );
      void queryClient.invalidateQueries({ queryKey: ['messaging-status'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Gagal memutus WhatsApp'),
  });

  const testMutation = useMutation({
    mutationFn: sendMessagingTestRequest,
    onSuccess: (result) => {
      const wa = result.whatsapp?.status ?? 'SKIPPED';
      const tg = result.telegram?.status ?? 'SKIPPED';
      if (wa === 'SENT' || tg === 'SENT') {
        toast.success(`Tes terkirim — WhatsApp: ${wa}, Telegram: ${tg}`);
      } else {
        toast.error(
          [
            result.whatsapp?.error,
            result.telegram?.error,
            'Tidak ada channel yang berhasil mengirim.',
          ]
            .filter(Boolean)
            .join(' | '),
        );
      }
      void queryClient.invalidateQueries({ queryKey: ['messaging-status'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Gagal mengirim tes notifikasi'),
  });

  const whatsapp = statusQuery.data?.whatsapp;
  const telegram = statusQuery.data?.telegram;
  const needsReset =
    whatsapp?.status === 'logged_out' ||
    Boolean(whatsapp?.lastError?.toLowerCase().includes('logout'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messaging</h1>
          <p className="text-sm text-muted-foreground">
            Notifikasi tiket dikirim lewat <strong>WhatsApp (Baileys)</strong> dan{' '}
            <strong>Telegram</strong>. WhatsApp memakai jeda + kuota anti-spam.
          </p>
        </div>
        <LoadingButton
          variant="outline"
          loading={testMutation.isPending}
          loadingText="Mengirim tes..."
          onClick={() => testMutation.mutate()}
        >
          <Send className="size-3.5" />
          Kirim tes ke akun saya
        </LoadingButton>
      </div>

      {statusQuery.isLoading ? (
        <LoadingState message="Memuat status messaging..." />
      ) : statusQuery.isError ? (
        <p className="text-sm text-destructive">
          {(statusQuery.error as Error).message ||
            'Gagal memuat status messaging. Pastikan backend berjalan dan Anda login sebagai admin.'}
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="size-4" />
                WhatsApp (Baileys)
              </CardTitle>
              <CardDescription>
                Scan QR memakai nomor WhatsApp pengirim notifikasi. Driver:{' '}
                {whatsapp?.driver ?? 'baileys'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    whatsapp?.status === 'connected' ? 'default' : 'outline'
                  }
                >
                  {whatsapp
                    ? STATUS_LABEL[whatsapp.status]
                    : 'Tidak diketahui'}
                </Badge>
                {whatsapp?.phoneNumber ? (
                  <span className="text-sm text-muted-foreground">
                    Nomor terhubung: +{whatsapp.phoneNumber}
                  </span>
                ) : null}
              </div>

              {whatsapp?.hint ? (
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {whatsapp.hint}
                </p>
              ) : null}

              {whatsapp?.qrDataUrl ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={whatsapp.qrDataUrl}
                    alt="WhatsApp QR code"
                    className="size-56 rounded-md bg-white p-2"
                  />
                  <div className="space-y-1 text-center text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Cara scan</p>
                    <p>WhatsApp → Setelan → Perangkat tertaut → Tautkan perangkat</p>
                    <p>QR kadaluarsa ~40 detik. Jika habis, klik hubungkan lagi.</p>
                  </div>
                </div>
              ) : null}

              {whatsapp?.lastError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <p className="font-medium">Detail masalah</p>
                  <p>{whatsapp.lastError}</p>
                </div>
              ) : null}

              {needsReset ? (
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Sesi lama sudah tidak valid. Gunakan tombol{' '}
                  <strong>Reset session & tampilkan QR</strong>, lalu scan ulang.
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <LoadingButton
                  loading={connectMutation.isPending}
                  loadingText="Menghubungkan..."
                  onClick={() => connectMutation.mutate(needsReset)}
                >
                  <RefreshCw className="size-3.5" />
                  {needsReset
                    ? 'Reset session & tampilkan QR'
                    : 'Hubungkan / Tampilkan QR'}
                </LoadingButton>
                {!needsReset ? (
                  <Button
                    variant="outline"
                    disabled={connectMutation.isPending}
                    onClick={() => connectMutation.mutate(true)}
                  >
                    Reset session & tampilkan QR
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  disabled={disconnectMutation.isPending}
                  onClick={() => disconnectMutation.mutate(false)}
                >
                  Putuskan sementara
                </Button>
                <Button
                  variant="outline"
                  disabled={disconnectMutation.isPending}
                  onClick={() => setConfirmLogout(true)}
                >
                  Logout sesi
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="size-4" />
                Telegram Bot
              </CardTitle>
              <CardDescription>
                Channel kedua untuk notifikasi tiket (selalu dikirim bersama WhatsApp
                jika user sudah tertaut).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={telegram?.enabled ? 'default' : 'outline'}>
                  {telegram?.enabled ? 'Aktif' : 'Nonaktif'}
                </Badge>
                {telegram?.botUsername ? (
                  <span className="text-muted-foreground">
                    @{telegram.botUsername}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Username bot belum di-set
                  </span>
                )}
                <Badge variant="outline">
                  Mode: {telegram?.ingressMode ?? 'disabled'}
                </Badge>
                <Badge variant="outline">
                  Tertaut: {telegram?.linkedUsers ?? 0} user
                </Badge>
              </div>

              {telegram?.hint ? (
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-muted-foreground">
                  {telegram.hint}
                </p>
              ) : null}

              {!telegram?.enabled ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">
                  Bot belum aktif. Isi <code>TELEGRAM_BOT_TOKEN</code> dan{' '}
                  <code>TELEGRAM_BOT_USERNAME</code> di backend, lalu restart.
                </p>
              ) : null}

              <ol className="list-decimal space-y-2 pl-4 text-muted-foreground">
                <li>
                  Pastikan token bot & username sudah di environment backend.
                </li>
                <li>
                  Local/dev memakai <code>polling</code> otomatis. Production set
                  webhook ke <code>/api/v1/messaging/telegram/webhook</code>.
                </li>
                <li>
                  Users → Edit user → salin Telegram link → user buka & tekan
                  Start.
                </li>
                <li>
                  Isi nomor WhatsApp user agar kedua channel ikut terkirim.
                </li>
                <li>
                  Pakai tombol <strong>Kirim tes ke akun saya</strong> untuk
                  memverifikasi WhatsApp + Telegram sekaligus.
                </li>
              </ol>

              {telegram?.deepLinkPrefix ? (
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs">
                  Prefix deep link: {telegram.deepLinkPrefix}
                  {'{token}'}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={(open) => {
          if (!open) setConfirmLogout(false);
        }}
        title="Logout WhatsApp session?"
        description="Logout sesi WhatsApp? File kredensial akan dihapus dan Anda harus scan QR lagi."
        confirmLabel="Logout"
        loading={disconnectMutation.isPending}
        onConfirm={async () => {
          await disconnectMutation.mutateAsync(true);
          setConfirmLogout(false);
        }}
      />
    </div>
  );
}
