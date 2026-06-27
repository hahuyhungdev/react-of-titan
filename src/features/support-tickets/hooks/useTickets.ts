import { useState, useEffect } from "react";
import type { Ticket } from "../types/ticket.types";

const MOCK_TICKETS: Ticket[] = [
  { id: "1", subject: "Unable to log in to dashboard", priority: "high" },
  { id: "2", subject: "Update profile photo issue", priority: "low" },
  { id: "3", subject: "API requests failing with 500 error", priority: "high" },
];

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTickets() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!cancelled) setTickets(MOCK_TICKETS);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load tickets");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchTickets();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tickets, isLoading, error };
}
