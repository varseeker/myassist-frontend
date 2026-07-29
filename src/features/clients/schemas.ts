import { z } from 'zod';

export const clientFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(160),
  companyName: z.string().max(200).optional(),
  description: z.string().min(10, 'Description is required').max(5000),
  logoUrl: z.string().max(1000).optional(),
  websiteUrl: z
    .union([
      z.literal(''),
      z.string().url('Website must be a valid URL'),
    ])
    .optional(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
