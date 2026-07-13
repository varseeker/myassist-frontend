import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(
      /^[a-zA-Z0-9._]+$/,
      'Username may only contain letters, numbers, dots, and underscores',
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(32, 'Username must be at most 32 characters')
      .regex(
        /^[a-zA-Z0-9._]+$/,
        'Username may only contain letters, numbers, dots, and underscores',
      ),
    email: z.union([z.literal(''), z.email('Invalid email address')]),
    fullName: z.string().min(2, 'Full name is required').max(120),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(
      /^[a-zA-Z0-9._]+$/,
      'Username may only contain letters, numbers, dots, and underscores',
    ),
  email: z.union([z.literal(''), z.email('Invalid email address')]),
  fullName: z.string().min(2, 'Full name is required').max(120),
  phoneNumber: z.string().optional(),
  whatsappEnabled: z.boolean(),
  telegramChatId: z.string().optional(),
  telegramEnabled: z.boolean(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
