import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from "@/shared/components/ui/Input/Input";
import { ROUTES } from "@/shared/constants";
import { useAuth } from "../../hooks/useAuth";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      navigate(ROUTES.DASHBOARD);
    } catch {
      // Error is handled by useAuth
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Create account</h1>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
        minLength={8}
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
