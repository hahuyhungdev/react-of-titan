// notifications — CAPABILITY vertical: features khác được import (whitelist trong ESLint).
// Store tối giản bằng useSyncExternalStore — không cần lib ngoài cho state nhỏ thế này.
import { useSyncExternalStore } from "react";

export type Notification = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

type Listener = () => void;

let notifications: Notification[] = [];
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

const store = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => notifications,
};

export function notify(input: Omit<Notification, "id">): void {
  const id = crypto.randomUUID();
  notifications = [...notifications, { ...input, id }];
  emitChange();
  setTimeout(() => dismiss(id), 5000);
}

export function dismiss(id: string): void {
  notifications = notifications.filter((n) => n.id !== id);
  emitChange();
}

export function useNotifications(): Notification[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
