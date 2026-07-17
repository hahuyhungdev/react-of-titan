// pages/login — page mỏng: chỉ compose feature + điều hướng.
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <main>
      <h1>Đăng nhập</h1>
      <LoginForm onSuccess={() => navigate("/dashboard")} />
    </main>
  );
}
