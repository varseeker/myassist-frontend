'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { getProjectSprintsRequest } from '@/features/projects/api';
import { updateTicketRequest } from '@/features/tickets/api';
import {
  TICKET_PRIORITIES,
  TICKET_TYPE_LABELS,
  TICKET_TYPES,
} from '@/lib/constants';
import type { Ticket, TicketPriority, TicketType } from '@/types';

interface TicketQaTriageSectionProps {
  ticket: Ticket;
}

export function TicketQaTriageSection({ ticket }: TicketQaTriageSectionProps) {
  const queryClient = useQueryClient();
  const [sprintId, setSprintId] = useState(ticket.sprintId ?? '');
  const [type, setType] = useState<TicketType>(ticket.type);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);

  useEffect(() => {
    setSprintId(ticket.sprintId ?? '');
    setType(ticket.type);
    setPriority(ticket.priority);
  }, [ticket]);

  const sprintsQuery = useQuery({
    queryKey: ['ticket-triage-sprints', ticket.projectId],
    queryFn: () => getProjectSprintsRequest(ticket.projectId, true),
    enabled: Boolean(ticket.projectId),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateTicketRequest(ticket.id, {
        sprintId: sprintId || undefined,
        type,
        priority,
      }),
    onSuccess: () => {
      toast.success('Ticket details updated');
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const hasChanges =
    sprintId !== (ticket.sprintId ?? '') ||
    type !== ticket.type ||
    priority !== ticket.priority;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="size-4 text-primary" />
          QA Triage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Assign sprint, adjust type and priority, then move the ticket to QA
          Review and assign a developer.
        </p>

        <div className="space-y-2">
          <Label htmlFor="triage-sprint">Sprint</Label>
          <NativeSelect
            id="triage-sprint"
            value={sprintId}
            onChange={(event) => setSprintId(event.target.value)}
            disabled={sprintsQuery.isLoading}
          >
            <option value="">Select sprint</option>
            {(sprintsQuery.data ?? []).map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
                {sprint.isActive ? ' (Active)' : ''}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="triage-type">Type</Label>
            <NativeSelect
              id="triage-type"
              value={type}
              onChange={(event) => setType(event.target.value as TicketType)}
            >
              {TICKET_TYPES.map((item) => (
                <option key={item} value={item}>
                  {TICKET_TYPE_LABELS[item]}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="triage-priority">Priority</Label>
            <NativeSelect
              id="triage-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TicketPriority)
              }
            >
              {TICKET_PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <LoadingButton
          className="w-full"
          disabled={!hasChanges || !sprintId}
          loading={updateMutation.isPending}
          loadingText="Saving..."
          onClick={() => void updateMutation.mutateAsync()}
        >
          Save triage details
        </LoadingButton>
      </CardContent>
    </Card>
  );
}
