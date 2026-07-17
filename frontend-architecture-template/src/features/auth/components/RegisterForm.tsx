import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button/Button';
import { RHFTextField } from '@/shared/components/rhf/RHFTextField';
import { registerSchema, type RegisterInput } from '../model/login.schema';
import { useRegister } from '../hooks/useRegister';

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const register = useRegister();
  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit((data) => {
    register.mutate(data, { onSuccess });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="auth-form">
      <h1>Đăng ký tài khoản</h1>
      <RHFTextField control={control} name="name" label="Họ và tên" type="text" autoComplete="name" />
      <RHFTextField control={control} name="email" label="Email" type="email" autoComplete="email" />
      <RHFTextField
        control={control}
        name="password"
        label="Mật khẩu"
        type="password"
        autoComplete="new-password"
      />
      <Button type="submit" isLoading={register.isPending}>
        Đăng ký
      </Button>
    </form>
  );
}
