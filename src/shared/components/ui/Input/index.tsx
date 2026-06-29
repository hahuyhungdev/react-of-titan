import styles from "./styles.module.scss";
import { useId, type InputHTMLAttributes, type Ref } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Shared Input component with optional label and error display.
 * Uses SCSS Modules to prevent style leaks or conflicts.
 */
export function Input({
  label,
  error,
  id,
  className,
  ref,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined;
  const containerClasses = [styles["input-group"], className].filter(Boolean).join(" ");
  const inputClasses = [styles.input, error ? styles["input-error"] : ""].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles["input-label"]}>
          {label}
        </label>
      )}
      <input
        {...props}
        ref={ref}
        id={inputId}
        className={inputClasses}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy}
      />
      {error && (
        <span id={errorId} className={styles["input-error-text"]} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
