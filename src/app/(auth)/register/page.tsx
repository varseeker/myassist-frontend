'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  registerRequest,
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth';
import { APP_NAME } from '@/lib/constants';
import { AUTH_ROUTES } from '@/lib/auth.constants';

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as never),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await registerRequest({
        username: values.username,
        email: values.email || undefined,
        fullName: values.fullName,
        password: values.password,
      });
      toast.success(result.message);
      router.push(AUTH_ROUTES.login);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Registration failed',
      );
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>
          Daftar sebagai User di {APP_NAME}. Admin/QA akan assign Anda ke
          project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...form.register('fullName')} />
            {form.formState.errors.fullName ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              {...form.register('username')}
            />
            {form.formState.errors.username ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.username.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opsional)</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register('email')}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <LoadingButton
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
            loadingText="Creating account..."
          >
            Register
          </LoadingButton>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link
            href={AUTH_ROUTES.login}
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
