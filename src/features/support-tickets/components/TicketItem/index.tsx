import { cn } from "@/shared/utils/cn";
import type { Ticket } from "../../types/ticket.types";
import styles from "../../styles.module.scss";

interface TicketItemProps {
  ticket: Ticket;
}

export function TicketItem({ ticket }: TicketItemProps) {
  return (
    <div className={styles["ticket-item"]}>
      <span className={styles["ticket-subject"]}>{ticket.subject}</span>
      <span className={cn(styles["ticket-priority"], styles[`ticket-priority-${ticket.priority}`])}>
        {ticket.priority.toUpperCase()}
      </span>
    </div>
  );
}
