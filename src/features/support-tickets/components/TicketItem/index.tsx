import type { Ticket } from "../../types/ticket.types";

interface TicketItemProps {
  ticket: Ticket;
}

export function TicketItem({ ticket }: TicketItemProps) {
  return (
    <div
      className="ticket-item"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-md)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface-raised)",
        marginBottom: "var(--space-sm)",
      }}
    >
      <span style={{ fontWeight: 500 }}>{ticket.subject}</span>
      <span
        style={{
          fontSize: "var(--text-xs)",
          padding: "var(--space-xs) var(--space-sm)",
          borderRadius: "var(--radius-sm)",
          background: ticket.priority === "high" ? "#ef4444" : "#3b82f6",
          color: "#ffffff",
          fontWeight: 600,
        }}
      >
        {ticket.priority.toUpperCase()}
      </span>
    </div>
  );
}
