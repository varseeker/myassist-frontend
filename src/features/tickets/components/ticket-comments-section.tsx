'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  createTicketCommentRequest,
  deleteTicketCommentRequest,
  getMentionableUsersRequest,
  getTicketCommentsRequest,
  updateTicketCommentRequest,
} from '@/features/tickets/api';
import { useAuthStore } from '@/features/auth/store';
import { getMentionQuery, renderCommentContent } from '@/lib/mentions';
import { cn } from '@/lib/utils';
import type { MentionableUser, TicketComment } from '@/types';

interface TicketCommentsSectionProps {
  ticketId: string;
}

export function TicketCommentsSection({ ticketId }: TicketCommentsSectionProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const commentsQuery = useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: () => getTicketCommentsRequest(ticketId, { limit: 50 }),
  });

  const mentionableQuery = useQuery({
    queryKey: ['mentionable-users', ticketId, mentionQuery],
    queryFn: () =>
      getMentionableUsersRequest(ticketId, mentionQuery || undefined),
    enabled: mentionQuery !== null,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { content: string }) =>
      createTicketCommentRequest(ticketId, payload),
    onSuccess: () => {
      setContent('');
      setMentionQuery(null);
      toast.success('Comment added');
      void queryClient.invalidateQueries({
        queryKey: ['ticket-comments', ticketId],
      });
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: { content: string };
    }) => updateTicketCommentRequest(ticketId, commentId, payload),
    onSuccess: () => {
      setEditingId(null);
      setEditContent('');
      toast.success('Comment updated');
      void queryClient.invalidateQueries({
        queryKey: ['ticket-comments', ticketId],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      deleteTicketCommentRequest(ticketId, commentId),
    onSuccess: () => {
      toast.success('Comment deleted');
      void queryClient.invalidateQueries({
        queryKey: ['ticket-comments', ticketId],
      });
      void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    const cursor = textareaRef.current.selectionStart;
    setMentionQuery(getMentionQuery(content, cursor));
  }, [content]);

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const insertMention = (mentionUser: MentionableUser) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const cursor = textarea.selectionStart;
    const beforeCursor = content.slice(0, cursor);
    const afterCursor = content.slice(cursor);
    const atIndex = beforeCursor.lastIndexOf('@');

    if (atIndex === -1) {
      return;
    }

    const nextContent = `${content.slice(0, atIndex)}@${mentionUser.email} ${afterCursor}`;
    setContent(nextContent);
    setMentionQuery(null);
    textarea.focus();
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    await createMutation.mutateAsync({ content: trimmed });
  };

  const startEdit = (comment: TicketComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const comments = commentsQuery.data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="comment">Add a comment</Label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="comment"
              rows={4}
              value={content}
              onChange={(event) => handleContentChange(event.target.value)}
              onKeyUp={(event) =>
                setMentionQuery(
                  getMentionQuery(
                    event.currentTarget.value,
                    event.currentTarget.selectionStart,
                  ),
                )
              }
              onClick={(event) =>
                setMentionQuery(
                  getMentionQuery(
                    event.currentTarget.value,
                    event.currentTarget.selectionStart,
                  ),
                )
              }
              placeholder="Write a comment... Use @email to mention someone"
              className={cn(
                'flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />

            {mentionQuery !== null &&
            (mentionableQuery.data?.length ?? 0) > 0 ? (
              <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover p-1 shadow-md">
                {mentionableQuery.data?.map((mentionUser) => (
                  <button
                    key={mentionUser.id}
                    type="button"
                    className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => insertMention(mentionUser)}
                  >
                    <span className="font-medium">{mentionUser.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      @{mentionUser.email}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex justify-end">
            <LoadingButton
              onClick={() => void handleSubmit()}
              disabled={!content.trim()}
              loading={createMutation.isPending}
              loadingText="Posting..."
            >
              Post Comment
            </LoadingButton>
          </div>
        </div>

        {commentsQuery.isLoading ? (
          <LoadingState message="Loading comments..." className="py-6" />
        ) : comments.length === 0 ? (
          <EmptyState
            compact
            icon={MessageSquare}
            title="No comments yet"
            description="Start the discussion. Use @email to mention teammates and keep everyone in the loop."
          />
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const isOwner = comment.user.id === user?.id;
              const isAdmin = user?.role === 'ADMIN';
              const canModify = isOwner || isAdmin;
              const isEditing = editingId === comment.id;

              return (
                <div
                  key={comment.id}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {comment.user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                        {comment.isEdited ? ' · edited' : ''}
                      </p>
                    </div>
                    {canModify && !isEditing ? (
                      <div className="flex gap-1">
                        {isOwner ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(comment)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm('Delete this comment?')) {
                              deleteMutation.mutate(comment.id);
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={editContent}
                        onChange={(event) => setEditContent(event.target.value)}
                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <LoadingButton
                          size="sm"
                          disabled={!editContent.trim()}
                          loading={updateMutation.isPending}
                          loadingText="Saving..."
                          onClick={() =>
                            void updateMutation.mutateAsync({
                              commentId: comment.id,
                              payload: { content: editContent.trim() },
                            })
                          }
                        >
                          Save
                        </LoadingButton>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {renderCommentContent(comment.content, comment.mentions)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
