// design-system/ui/ — PURE UI, zero business logic, zero vendor lib.
// Không biết "refund" hay "invoice" là gì. Chỉ nhận props và render.
// Component cần vendor (Radix, RHF, Recharts...) → đặt ở sub-folder riêng
// (form/, charts/...) và compose từ ui/ — KHÔNG import vendor vào ui/.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`ds-button ds-button--${variant}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? "Đang xử lý…" : children}
    </button>
  );
}
