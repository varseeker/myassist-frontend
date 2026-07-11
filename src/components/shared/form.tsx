'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  DefaultValues,
  FieldValues,
  Path,
  UseFormReturn,
  useForm,
} from 'react-hook-form';
import { z } from 'zod';
import { LoadingButton } from '@/components/shared/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
}

interface FormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  fields: FormFieldConfig<T>[];
  onSubmit: (values: T) => void | Promise<void>;
  submitLabel?: string;
  className?: string;
  children?: (form: UseFormReturn<T>) => React.ReactNode;
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  fields,
  onSubmit,
  submitLabel = 'Submit',
  className,
  children,
}: FormProps<T>) {
  const form = useForm({
    // Zod 4 schema typing differs from @hookform/resolvers overloads
    resolver: zodResolver(schema as never),
    defaultValues,
  }) as UseFormReturn<T>;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('space-y-4', className)}
    >
      {fields.map((field) => (
        <div key={String(field.name)} className="space-y-2">
          <Label htmlFor={String(field.name)}>{field.label}</Label>
          <Input
            id={String(field.name)}
            type={field.type ?? 'text'}
            placeholder={field.placeholder}
            {...form.register(field.name)}
          />
          {form.formState.errors[field.name] ? (
            <p className="text-sm text-destructive">
              {String(form.formState.errors[field.name]?.message)}
            </p>
          ) : null}
        </div>
      ))}

      {children?.(form)}

      <LoadingButton type="submit" loading={form.formState.isSubmitting} loadingText="Saving...">
        {submitLabel}
      </LoadingButton>
    </form>
  );
}
