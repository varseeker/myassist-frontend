import type { ReactNode } from 'react';
import type { TicketUserSummary } from '@/types';

const MENTION_EMAIL_REGEX =
  /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

export function renderCommentContent(
  content: string,
  mentions: TicketUserSummary[],
): ReactNode[] {
  const mentionEmails = new Set(mentions.map((user) => user.email.toLowerCase()));
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(MENTION_EMAIL_REGEX)) {
    const email = match[1];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      parts.push(content.slice(lastIndex, start));
    }

    if (mentionEmails.has(email.toLowerCase())) {
      parts.push(
        <span
          key={`${start}-${email}`}
          className="rounded bg-primary/10 px-1 font-medium text-primary"
        >
          @{email}
        </span>,
      );
    } else {
      parts.push(`@${email}`);
    }

    lastIndex = start + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [content];
}

export function getMentionQuery(value: string, cursor: number): string | null {
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/@([a-zA-Z0-9._%+-@]*)$/);

  if (!match) {
    return null;
  }

  return match[1];
}
