// infrastructure/websocket/socket.ts — WS adapter.
// Nhận message → emit lên event bus. KHÔNG biết feature nào lắng nghe.
// Thêm feature thứ N lắng nghe event: KHÔNG sửa file này (Open/Closed).
import { env } from "@/shared/config/env";
import { eventBus } from "@/shared/lib/event-bus";

let socket: WebSocket | null = null;

export function connectWebSocket(): () => void {
  socket = new WebSocket(env.VITE_WS_URL);

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data as string) as {
        type: string;
        payload: unknown;
      };
      eventBus.emit(message.type, message.payload);
    } catch {
      console.error("WS: malformed message");
    }
  };

  return () => {
    socket?.close();
    socket = null;
  };
}
