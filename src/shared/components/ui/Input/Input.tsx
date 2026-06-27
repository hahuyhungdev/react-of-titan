import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Shared Input component with optional label and error display.
 */
export function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`input-group ${className ?? ""}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input id={inputId} className={`input ${error ? "input-error" : ""}`} {...props} />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
