'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/shared/loading-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  forgotPasswordRequest,
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth';

export default function ForgotPasswordPage() {
  const [resetToken, setResetToken] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema as never),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const result = await forgotPasswordRequest(values.email);
      toast.success(result.message);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send reset link',
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we will send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@myassist.local"
              {...form.register('email')}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <LoadingButton
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
            loadingText="Sending..."
          >
            Send reset link
          </LoadingButton>
        </form>

        {resetToken ? (
          <div className="mt-4 rounded-md border bg-muted/50 p-3 text-sm">
            <p className="font-medium">Development reset token:</p>
            <p className="mt-1 break-all text-muted-foreground">{resetToken}</p>
            <Link
              href={`/reset-password?token=${resetToken}`}
              className="mt-2 inline-block text-primary underline-offset-4 hover:underline"
            >
              Continue to reset password
            </Link>
          </div>
        ) : null}

        <div className="mt-4 text-center text-sm">
          <Link
            href="/login"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
