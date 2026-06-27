import styles from "./styles.module.scss";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Shared Input component with optional label and error display.
 * Uses SCSS Modules to prevent style leaks or conflicts.
 */
export function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const containerClasses = [styles["input-group"], className].filter(Boolean).join(" ");
  const inputClasses = [styles.input, error ? styles["input-error"] : ""].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles["input-label"]}>
          {label}
        </label>
      )}
      <input id={inputId} className={inputClasses} {...props} />
      {error && <span className={styles["input-error-text"]}>{error}</span>}
    </div>
  );
}
