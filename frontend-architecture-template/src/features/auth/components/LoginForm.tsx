// LoginForm — DEMO FORM BEST PRACTICE:
// - Schema Zod (model/) là nguồn sự thật cho validation
// - RHF quản lý form state, zodResolver nối 2 thứ
// - RHFTextField (components/form) tự wire field + error — không wire thủ công
// - Submit logic trong hook (useLogin) — component chỉ wire mọi thứ lại
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button/Button";
import { RHFTextField } from "@/shared/components/rhf/RHFTextField";
import { loginSchema, type LoginInput } from "../model/login.schema";
import { useLogin } from "../hooks/useLogin";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const login = useLogin();
  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((data) => {
    login.mutate(data, { onSuccess });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <RHFTextField
        control={control}
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
      />
      <RHFTextField
        control={control}
        name="password"
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
      />
      <Button type="submit" isLoading={login.isPending}>
        Đăng nhập
      </Button>
    </form>
  );
}
