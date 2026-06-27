import { useState, useEffect } from "react";
import type { Notification } from "../types/notification.types";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Welcome to Titan",
    message: "Thank you for joining the Titan application platforms.",
    type: "info",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "System Update",
    message: "We've scheduled maintenance for Sunday at 2 AM UTC.",
    type: "warning",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    title: "Database Backup Successful",
    message: "The scheduled backup completed with zero errors.",
    type: "success",
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { notifications, isLoading };
}
