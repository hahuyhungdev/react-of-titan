// billing TỰ đăng ký event nó quan tâm (Scenario 11 — event-driven fan-out).
// Websocket adapter KHÔNG biết billing tồn tại.
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { eventBus } from "@/shared/lib/event-bus";

export function useBillingEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return eventBus.on("payment.completed", () => {
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    });
  }, [queryClient]);
}
