import { type ReactNode } from "react";
import {
  useForm,
  type UseFormReturn,
  type UseFormProps,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ZodType, type ZodTypeDef } from "zod";

interface FormProps<TFormValues extends FieldValues> {
  className?: string;
  onSubmit: SubmitHandler<TFormValues>;
  children: (methods: UseFormReturn<TFormValues>) => ReactNode;
  options?: UseFormProps<TFormValues>;
  schema?: ZodType<TFormValues, ZodTypeDef, TFormValues>;
  id?: string;
}

/**
 * Shared Form wrapper component.
 * Integrates react-hook-form with zod schema validation.
 * Uses render props to expose form methods to its children.
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
    resolver: schema
      ? (zodResolver(
          schema as unknown as Parameters<typeof zodResolver>[0]
        ) as unknown as Resolver<TFormValues>)
      : undefined,
  });

  return (
    <FormProvider {...methods}>
      <form id={id} className={className} onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        {children(methods)}
      </form>
    </FormProvider>
  );
}
