export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

export function isMediaPreviewable(mimeType: string): boolean {
  return isImageMimeType(mimeType) || isPdfMimeType(mimeType);
}
