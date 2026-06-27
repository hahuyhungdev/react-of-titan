import { type ReactNode } from "react";
import {
  useForm,
  type UseFormReturn,
  type UseFormProps,
  type FieldValues,
  FormProvider,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ZodType } from "zod";

interface FormProps<TFormValues extends FieldValues, Schema> {
  className?: string;
  onSubmit: (values: TFormValues) => void | Promise<void>;
  children: (methods: UseFormReturn<TFormValues, unknown, TFormValues>) => ReactNode;
  options?: UseFormProps<TFormValues>;
  schema?: Schema;
  id?: string;
}

export function Form<
  TFormValues extends FieldValues = FieldValues,
  Schema extends ZodType = ZodType,
>({ className, onSubmit, children, options, schema, id }: FormProps<TFormValues, Schema>) {
  const methods = useForm<TFormValues, unknown, TFormValues>({
    ...options,
    resolver: schema
      ? (zodResolver(schema as unknown as ZodType<TFormValues, TFormValues>) as unknown as Resolver<
          TFormValues,
          unknown
        >)
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
