import { TicketDetailContent } from '@/features/tickets/components/ticket-detail-content';

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { id } = await params;

  return <TicketDetailContent ticketId={id} />;
}
