import { useMutation, useQueryClient } from "@tanstack/react-query";
// ✅ capability — được whitelist; import trực tiếp file (không barrel)
import { notify } from "@/features/notifications/model/notifications.store";
import { login } from "../api/auth.api";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(["auth", "me"], user);
      notify({ type: "success", message: "Đăng nhập thành công" });
    },
    onError: () => {
      notify({ type: "error", message: "Email hoặc mật khẩu không đúng" });
    },
  });
}
