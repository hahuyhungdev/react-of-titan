import { useFormContext, Controller } from "react-hook-form";
import { Input } from "./ui/Input";

interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

/**
 * Shared FormField wrapper.
 * Connects the primitive shared Input UI component with react-hook-form's Controller,
 * making validation state and field registration automatic.
 */
export function FormField({ name, label, type = "text", placeholder, ...props }: FormFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input
          {...field}
          {...props}
          label={label}
          type={type}
          placeholder={placeholder}
          error={error?.message}
          value={(field.value as string) ?? ""}
        />
      )}
    />
  );
}
