// components/ui/text-field — input PURE UI.
// Nhận error message qua props — KHÔNG biết Zod/RHF là gì.
// Adapter RHF nằm ở components/form/RHFTextField.tsx.
import { useId, type InputHTMLAttributes } from 'react';
import './text-field.css';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...rest }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="ds-field">
      <label className="ds-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="ds-field__input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="ds-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
