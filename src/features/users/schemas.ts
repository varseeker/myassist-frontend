import { z } from 'zod';
import { USER_ROLES } from '@/lib/constants';

const roleEnum = z.enum(USER_ROLES);

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(
      /^[a-zA-Z0-9._]+$/,
      'Username may only contain letters, numbers, dots, and underscores',
    ),
  email: z
    .union([z.literal(''), z.email('Invalid email address')])
    .optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: roleEnum,
  phoneNumber: z.string().optional(),
  whatsappEnabled: z.boolean().optional(),
  telegramChatId: z.string().optional(),
  telegramEnabled: z.boolean().optional(),
  projectIds: z.array(z.string().uuid()).optional(),
});

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(32, 'Username must be at most 32 characters')
      .regex(
        /^[a-zA-Z0-9._]+$/,
        'Username may only contain letters, numbers, dots, and underscores',
      ),
    email: z.union([z.literal(''), z.email('Invalid email address')]).optional(),
    fullName: z.string().min(2, 'Full name is required'),
    role: roleEnum,
    isActive: z.boolean(),
    password: z.string().optional(),
    phoneNumber: z.string().optional(),
    whatsappEnabled: z.boolean().optional(),
    telegramChatId: z.string().optional(),
    telegramEnabled: z.boolean().optional(),
    projectIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => !data.password || data.password.length >= 8,
    {
      message: 'Password must be at least 8 characters',
      path: ['password'],
    },
  );

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
