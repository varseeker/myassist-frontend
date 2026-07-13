import type { ReactNode } from 'react';
import type { TicketUserSummary } from '@/types';

const MENTION_USERNAME_REGEX = /@([a-zA-Z0-9._]+)/g;

export function renderCommentContent(
  content: string,
  mentions: TicketUserSummary[],
): ReactNode[] {
  const mentionUsernames = new Set(
    mentions
      .map((user) => user.username?.toLowerCase())
      .filter((username): username is string => Boolean(username)),
  );
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(MENTION_USERNAME_REGEX)) {
    const username = match[1];
    const start = match.index ?? 0;
    const end = start + match[0].length;

    // Skip email-style leftovers (@local@domain)
    if (content[end] === '@') {
      continue;
    }

    if (start > lastIndex) {
      parts.push(content.slice(lastIndex, start));
    }

    if (mentionUsernames.has(username.toLowerCase())) {
      parts.push(
        <span
          key={`${start}-${username}`}
          className="rounded bg-primary/10 px-1 font-medium text-primary"
        >
          @{username}
        </span>,
      );
    } else {
      parts.push(`@${username}`);
    }

    lastIndex = end;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [content];
}

export function getMentionQuery(value: string, cursor: number): string | null {
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/@([a-zA-Z0-9._]*)$/);

  if (!match) {
    return null;
  }

  return match[1];
}
