'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Paperclip, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/store';
import {
  AttachmentMediaPreview,
  AttachmentPreviewMeta,
} from '@/features/tickets/components/attachment-media-preview';
import {
  ACCEPTED_ATTACHMENT_TYPES,
  deleteTicketAttachmentRequest,
  getAttachmentDownloadUrlRequest,
  getTicketAttachmentsRequest,
  MAX_ATTACHMENT_SIZE_BYTES,
  uploadTicketAttachmentRequest,
} from '@/features/tickets/api';
import { formatFileSize, isMediaPreviewable } from '@/lib/files';
import { cn } from '@/lib/utils';
import type { TicketAttachment } from '@/types';

interface TicketAttachmentsSectionProps {
  ticketId: string;
}

export function TicketAttachmentsSection({
  ticketId,
}: TicketAttachmentsSectionProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachmentsQuery = useQuery({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: () => getTicketAttachmentsRequest(ticketId, { limit: 50 }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadTicketAttachmentRequest(ticketId, file),
    onSuccess: () => {
      toast.success('File uploaded');
      void queryClient.invalidateQueries({
        queryKey: ['ticket-attachments', ticketId],
      });
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      deleteTicketAttachmentRequest(ticketId, attachmentId),
    onSuccess: () => {
      toast.success('Attachment deleted');
      void queryClient.invalidateQueries({
        queryKey: ['ticket-attachments', ticketId],
      });
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const downloadMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      getAttachmentDownloadUrlRequest(ticketId, attachmentId),
    onSuccess: (result) => {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      toast.error('File size exceeds the 10 MB limit');
      return;
    }

    await uploadMutation.mutateAsync(file);
  };

  const attachments = attachmentsQuery.data?.items ?? [];
  const mediaAttachments = attachments.filter((attachment) =>
    isMediaPreviewable(attachment.mimeType),
  );
  const otherAttachments = attachments.filter(
    (attachment) => !isMediaPreviewable(attachment.mimeType),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Attachments</CardTitle>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_ATTACHMENT_TYPES}
            onChange={(event) => void handleFileSelect(event)}
          />
          <LoadingButton
            variant="outline"
            size="sm"
            loading={uploadMutation.isPending}
            loadingText="Uploading..."
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Upload File
          </LoadingButton>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Max 10 MB. Supported: images, PDF, text, CSV, ZIP, Word, Excel.
        </p>

        {attachmentsQuery.isLoading ? (
          <LoadingState message="Loading attachments..." className="py-6" />
        ) : attachments.length === 0 ? (
          <EmptyState
            compact
            icon={Paperclip}
            title="No attachments yet"
            description="Upload screenshots, documents, or logs to help the team understand this ticket faster."
            action={
              <LoadingButton
                variant="outline"
                size="sm"
                loading={uploadMutation.isPending}
                loadingText="Uploading..."
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Upload file
              </LoadingButton>
            }
          />
        ) : (
          <>
            {mediaAttachments.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {mediaAttachments.map((attachment) => (
                  <AttachmentMediaCard
                    key={attachment.id}
                    ticketId={ticketId}
                    attachment={attachment}
                    canDelete={
                      attachment.uploadedBy.id === user?.id ||
                      user?.role === 'ADMIN'
                    }
                    onDownload={() => downloadMutation.mutate(attachment.id)}
                    onDelete={() => {
                      if (window.confirm(`Delete ${attachment.fileName}?`)) {
                        deleteMutation.mutate(attachment.id);
                      }
                    }}
                    isDownloading={downloadMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            ) : null}

            {otherAttachments.length > 0 ? (
              <div className="space-y-2">
                {otherAttachments.map((attachment) => {
                  const canDelete =
                    attachment.uploadedBy.id === user?.id ||
                    user?.role === 'ADMIN';

                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <Paperclip className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {attachment.fileName}
                          </p>
                          <AttachmentPreviewMeta attachment={attachment} />
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={downloadMutation.isPending}
                          onClick={() => downloadMutation.mutate(attachment.id)}
                        >
                          <Download className="size-3.5" />
                          Download
                        </Button>
                        {canDelete ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete ${attachment.fileName}?`,
                                )
                              ) {
                                deleteMutation.mutate(attachment.id);
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface AttachmentMediaCardProps {
  ticketId: string;
  attachment: TicketAttachment;
  canDelete: boolean;
  onDownload: () => void;
  onDelete: () => void;
  isDownloading: boolean;
  isDeleting: boolean;
}

function AttachmentMediaCard({
  ticketId,
  attachment,
  canDelete,
  onDownload,
  onDelete,
  isDownloading,
  isDeleting,
}: AttachmentMediaCardProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border')}>
      <AttachmentMediaPreview ticketId={ticketId} attachment={attachment} />
      <div className="space-y-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{attachment.fileName}</p>
          <AttachmentPreviewMeta attachment={attachment} />
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={isDownloading}
            onClick={onDownload}
          >
            <Download className="size-3.5" />
            Open
          </Button>
          {canDelete ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
