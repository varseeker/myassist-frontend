'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { scrollToTop } from '@/lib/smooth-scroll';
import { cn } from '@/lib/utils';

const SHOW_AFTER_PX = 320;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={cn(
        'landing-scroll-top fixed bottom-6 right-6 z-50 size-10 rounded-full shadow-md backdrop-blur-sm',
        visible && 'landing-scroll-top-visible',
      )}
    >
      <ArrowUp className="size-4" />
    </Button>
  );
}
