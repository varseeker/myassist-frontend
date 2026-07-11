import { z } from 'zod';
import { USER_ROLES } from '@/lib/constants';

const roleEnum = z.enum(USER_ROLES);

export const createUserSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: roleEnum,
  projectIds: z.array(z.string().uuid()).optional(),
});

export const updateUserSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    role: roleEnum,
    isActive: z.boolean(),
    password: z.string().optional(),
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
