import { type ReactNode } from "react";
import {
  useForm,
  type UseFormReturn,
  type UseFormProps,
  type FieldValues,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ZodTypeAny } from "zod";

interface FormProps<TFormValues extends FieldValues> {
  className?: string;
  onSubmit: (values: TFormValues) => void | Promise<void>;
  children: ReactNode | ((methods: UseFormReturn<TFormValues, unknown, TFormValues>) => ReactNode);
  options?: UseFormProps<TFormValues>;
  schema?: ZodTypeAny;
  id?: string;
}

/**
 * Shared Form wrapper component.
 * Integrates react-hook-form with zod schema validation.
 * Supports both direct ReactNode children and render props.
 */
export function Form<TFormValues extends FieldValues = FieldValues>({
  className,
  onSubmit,
  children,
  options,
  schema,
  id,
}: FormProps<TFormValues>) {
  const methods = useForm<TFormValues>({
    ...options,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: schema ? (zodResolver(schema as any) as any) : undefined,
  });

  return (
    <FormProvider {...methods}>
      <form id={id} className={className} onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        {typeof children === "function" ? children(methods) : children}
      </form>
    </FormProvider>
  );
}
