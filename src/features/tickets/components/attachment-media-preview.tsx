'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { getAttachmentDownloadUrlRequest } from '@/features/tickets/api';
import {
  formatFileSize,
  isImageMimeType,
  isPdfMimeType,
} from '@/lib/files';
import { cn } from '@/lib/utils';
import type { TicketAttachment } from '@/types';

interface AttachmentMediaPreviewProps {
  ticketId: string;
  attachment: TicketAttachment;
  className?: string;
}

export function AttachmentMediaPreview({
  ticketId,
  attachment,
  className,
}: AttachmentMediaPreviewProps) {
  const isImage = isImageMimeType(attachment.mimeType);
  const isPdf = isPdfMimeType(attachment.mimeType);
  const previewEnabled = isImage || isPdf;

  const previewQuery = useQuery({
    queryKey: ['attachment-preview', ticketId, attachment.id],
    queryFn: () => getAttachmentDownloadUrlRequest(ticketId, attachment.id),
    enabled: previewEnabled,
    staleTime: 45 * 60 * 1000,
  });

  if (!previewEnabled) {
    return null;
  }

  if (previewQuery.isLoading) {
    return (
      <div
        className={cn(
          'flex aspect-video items-center justify-center rounded-lg border bg-muted/30',
          className,
        )}
      >
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (previewQuery.isError || !previewQuery.data?.url) {
    return (
      <div
        className={cn(
          'flex aspect-video items-center justify-center rounded-lg border bg-muted/20 text-xs text-muted-foreground',
          className,
        )}
      >
        Preview unavailable
      </div>
    );
  }

  const previewUrl = previewQuery.data.url;

  if (isImage) {
    return (
      <button
        type="button"
        onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
        className={cn(
          'group relative block w-full overflow-hidden rounded-lg border bg-muted/20',
          className,
        )}
        aria-label={`Preview ${attachment.fileName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={attachment.fileName}
          className="aspect-video w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-muted/20',
        className,
      )}
    >
      <iframe
        src={previewUrl}
        title={attachment.fileName}
        className="aspect-[4/3] w-full bg-background"
      />
    </div>
  );
}

interface AttachmentPreviewMetaProps {
  attachment: TicketAttachment;
}

export function AttachmentPreviewMeta({ attachment }: AttachmentPreviewMetaProps) {
  return (
    <p className="text-xs text-muted-foreground">
      {formatFileSize(attachment.fileSize)} · {attachment.uploadedBy.fullName} ·{' '}
      {new Date(attachment.createdAt).toLocaleString()}
    </p>
  );
}
