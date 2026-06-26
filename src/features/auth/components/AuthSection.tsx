import { type ReactNode } from "react";
import { Link } from "react-router";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

interface AuthSectionProps {
  mode: "login" | "register";
}

/**
 * Compound component — composes auth form + footer link.
 * The page only needs to render this single component.
 */
export function AuthSection({ mode }: AuthSectionProps) {
  const footer: Record<typeof mode, ReactNode> = {
    login: (
      <p className="auth-footer">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    ),
    register: (
      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    ),
  };

  return (
    <div className="auth-page">
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
      {footer[mode]}
    </div>
  );
}
