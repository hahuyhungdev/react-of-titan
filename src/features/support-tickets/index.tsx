import { TicketItem } from "./components/TicketItem";
import { useTickets } from "./hooks/useTickets";

export function TicketList() {
  const { tickets, isLoading, error } = useTickets();

  if (isLoading) return <div className="page-loading">Loading support tickets…</div>;
  if (error) {
    return (
      <div className="page-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <section className="support-tickets-section" aria-label="Support tickets">
      <div className="ticket-list">
        {tickets.map((ticket) => (
          <TicketItem key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </section>
  );
}

export default TicketList;
