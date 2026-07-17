// components/form/RHFTextField.tsx — ADAPTER giữa react-hook-form và pure UI.
//
// Phân tầng trong components/:
//   ui/    → pure UI, KHÔNG biết vendor lib nào (TextField không biết RHF)
//   form/  → nơi DUY NHẤT trong components/ biết react-hook-form
//   icons/ → SVG converted components
//
// Features dùng RHFTextField → không phải wire error/field thủ công.
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { InputHTMLAttributes } from "react";
import { TextField } from "../ui/text-field/TextField";

type RHFTextFieldProps<T extends FieldValues> = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "defaultValue"
> & {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
};

export function RHFTextField<T extends FieldValues>({
  control,
  name,
  label,
  ...rest
}: RHFTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          label={label}
          error={fieldState.error?.message}
          {...field}
          {...rest}
        />
      )}
    />
  );
}
