import { type ReactNode } from "react";
import {
  useForm,
  type UseFormReturn,
  type UseFormProps,
  type FieldValues,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ZodType, type ZodTypeDef } from "zod";

interface FormProps<TFormValues extends FieldValues, Schema> {
  className?: string;
  onSubmit: (values: TFormValues) => void | Promise<void>;
  children: (methods: UseFormReturn<TFormValues>) => ReactNode;
  options?: UseFormProps<TFormValues>;
  schema?: Schema;
  id?: string;
}

/**
 * Shared Form wrapper component.
 * Integrates react-hook-form with zod schema validation.
 * Uses render props to expose form methods to its children.
 */
export function Form<
  TFormValues extends FieldValues = FieldValues,
  Schema extends ZodType<unknown, ZodTypeDef, unknown> = ZodType<unknown, ZodTypeDef, unknown>,
>({ className, onSubmit, children, options, schema, id }: FormProps<TFormValues, Schema>) {
  const methods = useForm<TFormValues>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return (
    <FormProvider {...methods}>
      <form id={id} className={className} onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        {children(methods)}
      </form>
    </FormProvider>
  );
}
