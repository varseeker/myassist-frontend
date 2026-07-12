'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, History, StickyNote, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingButton } from '@/components/shared/loading-button';
import { LoadingState } from '@/components/shared/loading-state';
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { useAuthStore } from '@/features/auth/store';
import {
  deleteTicketRequest,
  getAssigneesRequest,
  getProjectMembersRequest,
  getTicketRequest,
  updateTicketStatusRequest,
} from '@/features/tickets/api';
import { TicketAttachmentsSection } from '@/features/tickets/components/ticket-attachments-section';
import { TicketCommentsSection } from '@/features/tickets/components/ticket-comments-section';
import { TicketQaTriageSection } from '@/features/tickets/components/ticket-qa-triage-section';
import { TICKET_TYPE_LABELS } from '@/lib/constants';
import type { TicketHistory, TicketStatus } from '@/types';

interface TicketDetailContentProps {
  ticketId: string;
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  USER_INPUT: 'User Input',
  QA_REVIEW: 'QA Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WAITING_INFORMATION: 'Waiting Information',
  DONE: 'Done',
  RESOLVED: 'Resolved',
  REOPENED: 'Reopened',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

const ACTION_LABELS: Record<string, string> = {
  TICKET_CREATED: 'Ticket created',
  TICKET_UPDATED: 'Ticket updated',
  STATUS_CHANGED: 'Status changed',
  TICKET_DELETED: 'Ticket deleted',
  COMMENT_ADDED: 'Comment added',
  COMMENT_DELETED: 'Comment deleted',
  ATTACHMENT_ADDED: 'Attachment added',
  ATTACHMENT_DELETED: 'Attachment deleted',
};

function getHistoryNote(history: TicketHistory): string | null {
  const note = history.metadata?.note;
  return typeof note === 'string' && note.trim() ? note.trim() : null;
}

export function TicketDetailContent({ ticketId }: TicketDetailContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');
  const [assigneeId, setAssigneeId] = useState('');
  const [mentionUserId, setMentionUserId] = useState('');
  const [note, setNote] = useState('');

  const ticketQuery = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicketRequest(ticketId),
  });

  const assigneesQuery = useQuery({
    queryKey: ['ticket-assignees', ticketQuery.data?.projectId],
    queryFn: () => getAssigneesRequest(ticketQuery.data?.projectId),
    enabled:
      (user?.role === 'ADMIN' || user?.role === 'QA') &&
      Boolean(ticketQuery.data?.projectId),
  });

  const membersQuery = useQuery({
    queryKey: ['ticket-project-members', ticketQuery.data?.projectId],
    queryFn: () => getProjectMembersRequest(ticketQuery.data!.projectId),
    enabled:
      (user?.role === 'ADMIN' || user?.role === 'QA') &&
      Boolean(ticketQuery.data?.projectId) &&
      selectedStatus === 'RESOLVED',
  });

  const statusMutation = useMutation({
    mutationFn: (payload: {
      status: TicketStatus;
      assignedToId?: string;
      mentionUserId?: string;
      note: string;
    }) => updateTicketStatusRequest(ticketId, payload),
    onSuccess: () => {
      toast.success('Ticket status updated');
      setSelectedStatus('');
      setAssigneeId('');
      setMentionUserId('');
      setNote('');
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
      void queryClient.invalidateQueries({
        queryKey: ['ticket-comments', ticketId],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicketRequest(ticketId),
    onSuccess: () => {
      toast.success('Ticket deleted');
      router.push('/tickets');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const ticket = ticketQuery.data;
  const transitions = ticket?.availableTransitions ?? [];
  const requiresAssignee = selectedStatus === 'ASSIGNED';
  const requiresMention = selectedStatus === 'RESOLVED';
  const canTriage =
    ticket?.status === 'USER_INPUT' &&
    (user?.role === 'QA' || user?.role === 'ADMIN');

  const statusNotes = useMemo(() => {
    if (!ticket?.histories) {
      return [];
    }
    return ticket.histories.filter(
      (history) =>
        history.action === 'STATUS_CHANGED' && getHistoryNote(history),
    );
  }, [ticket?.histories]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      return;
    }

    if (!note.trim() || note.trim().length < 3) {
      toast.error('Note wajib diisi (minimal 3 karakter)');
      return;
    }

    if (requiresAssignee && !assigneeId) {
      toast.error('Please select a developer to assign');
      return;
    }

    if (requiresMention && !mentionUserId) {
      toast.error('Pilih user untuk uji ulang tiket');
      return;
    }

    await statusMutation.mutateAsync({
      status: selectedStatus,
      assignedToId: assigneeId || undefined,
      mentionUserId: mentionUserId || undefined,
      note: note.trim(),
    });
  };

  if (ticketQuery.isLoading) {
    return <LoadingState message="Loading ticket..." />;
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <>
        <p className="text-sm text-destructive">Failed to load ticket.</p>
        <Link
          href="/tickets"
          className={buttonVariants({ variant: 'outline', className: 'mt-4' })}
        >
          Back to tickets
        </Link>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/tickets"
            className={buttonVariants({
              variant: 'ghost',
              size: 'sm',
              className: '-ml-2',
            })}
          >
            <ArrowLeft className="size-4" />
            Back to tickets
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {ticket.ticketNumber}
            </h1>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <p className="text-lg text-foreground">{ticket.title}</p>
          <p className="text-sm text-muted-foreground">
            Last updated {new Date(ticket.updatedAt).toLocaleString()}
          </p>
        </div>

        {user?.role === 'ADMIN' ? (
          <Button
            variant="outline"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Delete ticket ${ticket.ticketNumber}? This cannot be undone.`,
                )
              ) {
                deleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          <TicketCommentsSection ticketId={ticketId} />

          <TicketAttachmentsSection ticketId={ticketId} />

          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.histories.length === 0 ? (
                <EmptyState
                  compact
                  icon={History}
                  title="No activity recorded yet"
                  description="Status changes, assignments, and other workflow actions will appear in this timeline."
                />
              ) : (
                ticket.histories.map((history) => {
                  const historyNote = getHistoryNote(history);
                  return (
                    <div
                      key={history.id}
                      className="border-l-2 border-muted pl-4"
                    >
                      <p className="text-sm font-medium">
                        {ACTION_LABELS[history.action] ?? history.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {history.user.fullName} ·{' '}
                        {new Date(history.createdAt).toLocaleString()}
                      </p>
                      {history.fromStatus && history.toStatus ? (
                        <p className="mt-1 text-xs">
                          {STATUS_LABELS[history.fromStatus]} →{' '}
                          {STATUS_LABELS[history.toStatus]}
                        </p>
                      ) : null}
                      {historyNote ? (
                        <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                          Note: {historyNote}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Project</p>
                <p>
                  {ticket.project
                    ? `${ticket.project.name} (${ticket.project.code})`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Sprint</p>
                <p>
                  {ticket.sprint
                    ? `${ticket.sprint.name}${ticket.sprint.isActive ? ' · Active' : ''}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p>{TICKET_TYPE_LABELS[ticket.type]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reporter</p>
                <p>{ticket.createdBy?.fullName ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assignee</p>
                <p>{ticket.assignedTo?.fullName ?? 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Verification</p>
                <p>{ticket.verificationUser?.fullName ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last update</p>
                <p>{new Date(ticket.updatedAt).toLocaleString()}</p>
              </div>
              {ticket.resolvedAt ? (
                <div>
                  <p className="text-muted-foreground">Resolved</p>
                  <p>{new Date(ticket.resolvedAt).toLocaleString()}</p>
                </div>
              ) : null}
              {ticket.closedAt ? (
                <div>
                  <p className="text-muted-foreground">Closed</p>
                  <p>{new Date(ticket.closedAt).toLocaleString()}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusNotes.length === 0 ? (
                <EmptyState
                  compact
                  icon={StickyNote}
                  title="Belum ada catatan status"
                  description="Setiap perubahan status akan menampilkan note di sini."
                />
              ) : (
                statusNotes.map((history) => (
                  <div
                    key={history.id}
                    className="rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {history.fromStatus && history.toStatus ? (
                        <span>
                          {STATUS_LABELS[history.fromStatus]} →{' '}
                          {STATUS_LABELS[history.toStatus]}
                        </span>
                      ) : null}
                      <span>·</span>
                      <span>{history.user.fullName}</span>
                      <span>·</span>
                      <span>
                        {new Date(history.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {getHistoryNote(history)}
                    </p>
                    {typeof history.metadata?.mentionUserName === 'string' ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Mention: {history.metadata.mentionUserName}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {canTriage ? <TicketQaTriageSection ticket={ticket} /> : null}

          {transitions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Next status</Label>
                  <NativeSelect
                    id="status"
                    value={selectedStatus}
                    onChange={(event) => {
                      const value = event.target.value as TicketStatus | '';
                      setSelectedStatus(value);
                      if (value !== 'RESOLVED') {
                        setMentionUserId('');
                      }
                    }}
                  >
                    <option value="">Select status...</option>
                    {transitions.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </NativeSelect>
                </div>

                {requiresAssignee ? (
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assign to</Label>
                    <NativeSelect
                      id="assignee"
                      value={assigneeId}
                      onChange={(event) => setAssigneeId(event.target.value)}
                    >
                      <option value="">Select developer...</option>
                      {(assigneesQuery.data ?? []).map((assignee) => (
                        <option key={assignee.id} value={assignee.id}>
                          {assignee.fullName}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                ) : null}

                {requiresMention ? (
                  <div className="space-y-2">
                    <Label htmlFor="mention-user">
                      Mention user untuk uji ulang
                    </Label>
                    <NativeSelect
                      id="mention-user"
                      value={mentionUserId}
                      onChange={(event) => setMentionUserId(event.target.value)}
                    >
                      <option value="">Pilih user...</option>
                      {(membersQuery.data ?? []).map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.fullName}
                          {member.email ? ` (${member.email})` : ''}
                        </option>
                      ))}
                    </NativeSelect>
                    <p className="text-xs text-muted-foreground">
                      User ini akan diminta mencoba tiket lagi, lalu Close atau
                      Reopen.
                    </p>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="note">Note (wajib)</Label>
                  <textarea
                    id="note"
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Jelaskan alasan perubahan status..."
                    className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                    required
                  />
                </div>

                <LoadingButton
                  className="w-full"
                  disabled={
                    !selectedStatus ||
                    note.trim().length < 3 ||
                    (requiresAssignee && !assigneeId) ||
                    (requiresMention && !mentionUserId)
                  }
                  loading={statusMutation.isPending}
                  loadingText="Updating..."
                  onClick={() => void handleStatusUpdate()}
                >
                  Update Status
                </LoadingButton>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
