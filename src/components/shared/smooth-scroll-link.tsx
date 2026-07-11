'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { scrollToHash } from '@/lib/smooth-scroll';
import { cn } from '@/lib/utils';

type SmoothScrollLinkProps = ComponentProps<'a'> & {
  href: string;
};

export function SmoothScrollLink({
  href,
  className,
  children,
  onClick,
  ...props
}: SmoothScrollLinkProps) {
  if (!href.startsWith('#')) {
    return (
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={cn(className)}
      onClick={(event) => {
        event.preventDefault();
        scrollToHash(href);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
