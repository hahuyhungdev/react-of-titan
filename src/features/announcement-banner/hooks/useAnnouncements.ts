import { useState, useEffect } from "react";
import type { Announcement } from "../types/announcement.types";

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: "1", content: "System maintenance scheduled for Sunday at 2 AM UTC.", date: "2026-06-27" },
  {
    id: "2",
    content: "Version 2.0 release is now live! Check out the changelog.",
    date: "2026-06-26",
  },
];

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnnouncements() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!cancelled) setAnnouncements(MOCK_ANNOUNCEMENTS);
      } catch (err: unknown) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load announcements");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  return { announcements, isLoading, error };
}
