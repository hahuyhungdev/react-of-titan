import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api/auth.api";
import { notify } from "@/features/notifications/model/notifications.store";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      notify({ type: "success", message: "Đăng xuất thành công" });
    },
    onError: () => {
      notify({ type: "error", message: "Đăng xuất thất bại" });
    },
  });
}
