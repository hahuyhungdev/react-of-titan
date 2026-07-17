import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/features/notifications/model/notifications.store';
import { registerUser } from '../api/auth.api';

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(['auth', 'me'], user);
      notify({ type: 'success', message: 'Đăng ký tài khoản thành công' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Đăng ký thất bại, email có thể đã tồn tại' });
    },
  });
}
