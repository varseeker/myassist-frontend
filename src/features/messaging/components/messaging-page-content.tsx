'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, QrCode, RefreshCw } from 'lucide-react';
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
import {
  connectWhatsAppRequest,
  disconnectWhatsAppRequest,
  getMessagingStatusRequest,
} from '@/features/messaging/api';

export function MessagingPageContent() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['messaging-status'],
    queryFn: getMessagingStatusRequest,
    refetchInterval: (query) => {
      const status = query.state.data?.whatsapp.status;
      return status === 'qr' || status === 'connecting' ? 3000 : 15000;
    },
  });

  const connectMutation = useMutation({
    mutationFn: connectWhatsAppRequest,
    onSuccess: () => {
      toast.success('WhatsApp connect started');
      void queryClient.invalidateQueries({ queryKey: ['messaging-status'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const disconnectMutation = useMutation({
    mutationFn: (logout: boolean) => disconnectWhatsAppRequest(logout),
    onSuccess: () => {
      toast.success('WhatsApp disconnected');
      void queryClient.invalidateQueries({ queryKey: ['messaging-status'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const whatsapp = statusQuery.data?.whatsapp;
  const telegram = statusQuery.data?.telegram;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messaging</h1>
        <p className="text-sm text-muted-foreground">
          Connect WhatsApp (Baileys) and Telegram bot for ticket notifications.
          Meta Cloud API can be enabled later via env without rewriting the app.
        </p>
      </div>

      {statusQuery.isLoading ? (
        <LoadingState message="Loading messaging status..." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="size-4" />
                WhatsApp (Baileys)
              </CardTitle>
              <CardDescription>
                Scan QR with the admin WhatsApp number. Driver:{' '}
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
                  {whatsapp?.status ?? 'unknown'}
                </Badge>
                {whatsapp?.phoneNumber ? (
                  <span className="text-sm text-muted-foreground">
                    Linked: +{whatsapp.phoneNumber}
                  </span>
                ) : null}
              </div>

              {whatsapp?.qrDataUrl ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={whatsapp.qrDataUrl}
                    alt="WhatsApp QR code"
                    className="size-56 rounded-md bg-white p-2"
                  />
                  <p className="text-center text-sm text-muted-foreground">
                    Open WhatsApp → Linked Devices → Link a Device
                  </p>
                </div>
              ) : null}

              {whatsapp?.lastError ? (
                <p className="text-sm text-destructive">{whatsapp.lastError}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <LoadingButton
                  loading={connectMutation.isPending}
                  loadingText="Connecting..."
                  onClick={() => connectMutation.mutate()}
                >
                  <RefreshCw className="size-3.5" />
                  Connect / Refresh QR
                </LoadingButton>
                <Button
                  variant="outline"
                  disabled={disconnectMutation.isPending}
                  onClick={() => disconnectMutation.mutate(false)}
                >
                  Disconnect
                </Button>
                <Button
                  variant="outline"
                  disabled={disconnectMutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Logout WhatsApp session? You will need to scan QR again.',
                      )
                    ) {
                      disconnectMutation.mutate(true);
                    }
                  }}
                >
                  Logout session
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
                Users link their chat via deep link token from the Users page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={telegram?.enabled ? 'default' : 'outline'}>
                  {telegram?.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                {telegram?.botUsername ? (
                  <span className="text-muted-foreground">
                    @{telegram.botUsername}
                  </span>
                ) : null}
              </div>

              <ol className="list-decimal space-y-2 pl-4 text-muted-foreground">
                <li>
                  Set <code>TELEGRAM_BOT_TOKEN</code> and{' '}
                  <code>TELEGRAM_BOT_USERNAME</code> on the backend.
                </li>
                <li>
                  Point webhook to{' '}
                  <code>/api/v1/messaging/telegram/webhook</code>.
                </li>
                <li>
                  Open a user in Users → copy Telegram link → user opens it and
                  taps Start.
                </li>
                <li>
                  Add each user&apos;s WhatsApp phone number on the Users form.
                </li>
              </ol>

              {telegram?.deepLinkPrefix ? (
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs">
                  Deep link prefix: {telegram.deepLinkPrefix}
                  {'{token}'}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
