import { Suspense } from 'react';
import { LoadingState } from '@/components/shared/loading-state';
import { TicketsPageContent } from '@/features/tickets/components/tickets-page-content';

export default function TicketsPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading tickets..." />}>
      <TicketsPageContent />
    </Suspense>
  );
}
