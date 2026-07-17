// shared/lib/event-bus.ts — generic pub/sub cho fan-out communication.
// KHÔNG biết gì về nghiệp vụ. Features tự subscribe event chúng quan tâm.
// Dùng khi: 1 event (vd websocket) → nhiều features phản ứng độc lập.
// KHÔNG dùng thay cho props/composition trong flow đơn giản.

type Handler<T = unknown> = (payload: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listeners = new Map<string, Set<Handler<any>>>();

export const eventBus = {
  /** Subscribe. Trả về hàm unsubscribe — dùng làm cleanup trong useEffect. */
  on<T>(event: string, handler: Handler<T>): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler);
    return () => listeners.get(event)?.delete(handler);
  },

  emit<T>(event: string, payload: T): void {
    listeners.get(event)?.forEach((handler) => handler(payload));
  },
};
