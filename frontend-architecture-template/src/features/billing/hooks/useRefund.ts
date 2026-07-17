import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/features/notifications/model/notifications.store";
import { refundPayment } from "../api/billing.api";

export function useRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refundPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify({ type: "success", message: "Hoàn tiền thành công" });
    },
    onError: () => {
      notify({ type: "error", message: "Hoàn tiền thất bại, thử lại sau" });
    },
  });
}
