'use client';

import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  bulkImportUsersRequest,
  type BulkImportUsersResult,
} from '@/features/users/api';

interface BulkImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export function BulkImportUsersDialog({
  open,
  onOpenChange,
  onImported,
}: BulkImportUsersDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkImportUsersResult | null>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (loading) return;
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Pilih file CSV atau Excel terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const importResult = await bulkImportUsersRequest(file);
      setResult(importResult);
      if (importResult.createdCount > 0) {
        onImported();
      }
      if (importResult.errorCount === 0) {
        toast.success(`${importResult.createdCount} user berhasil dibuat`);
      } else if (importResult.createdCount === 0) {
        toast.error('Semua baris gagal diimport');
      } else {
        toast.warning(
          `${importResult.createdCount} berhasil, ${importResult.errorCount} gagal`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Bulk import failed',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk import users</DialogTitle>
          <DialogDescription>
            Upload CSV atau Excel dengan kolom:{' '}
            <code>username, role, project</code>. Project divalidasi by code
            atau name. Password default:{' '}
            <code>{'{username}1234'}</code> (contoh: johndoe → johndoe1234)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed p-4 text-sm">
            <p className="font-medium">Contoh CSV</p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
              {`username,role,project
johndoe,USER,NET
alice.qa,QA,NET
bob.dev,DEVELOPER,NET
superadmin,ADMIN,`}
            </pre>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResult(null);
              }}
            />
            {file ? (
              <Badge variant="outline" className="w-fit">
                {file.name}
              </Badge>
            ) : null}
          </div>

          {result ? (
            <div className="space-y-2">
              <p className="text-sm">
                Total {result.totalRows} · Created {result.createdCount} · Error{' '}
                {result.errorCount}
              </p>
              <div className="max-h-64 overflow-auto rounded-lg border">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Username</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((item) => (
                      <tr
                        key={`${item.row}-${item.username}`}
                        className="border-t"
                      >
                        <td className="px-3 py-2">{item.row}</td>
                        <td className="px-3 py-2">{item.username || '—'}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={
                              item.status === 'created'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          {item.message}
                          {item.temporaryPassword
                            ? ` · password: ${item.temporaryPassword}`
                            : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => handleClose(false)}
          >
            Close
          </Button>
          <LoadingButton
            type="button"
            loading={loading}
            loadingText="Importing..."
            disabled={!file}
            onClick={() => void handleImport()}
          >
            <Upload className="size-4" />
            Import
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
