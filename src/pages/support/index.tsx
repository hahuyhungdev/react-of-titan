import { TicketList } from "@/features/support-tickets";

export function SupportPage() {
  return (
    <div className="page support-page">
      <h1>Support Tickets</h1>
      <TicketList />
    </div>
  );
}

export default SupportPage;
