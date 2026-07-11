import { z } from 'zod';
import {
  TICKET_PRIORITIES,
  TICKET_TYPES,
} from '@/lib/constants';

export const userCreateTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const staffCreateTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(TICKET_TYPES),
  priority: z.enum(TICKET_PRIORITIES).default('MEDIUM'),
  projectId: z.string().uuid().optional(),
  sprintId: z.string().uuid('Please select a sprint'),
});

export const createTicketSchema = staffCreateTicketSchema;

export const updateTicketSchema = staffCreateTicketSchema.partial().extend({
  sprintId: z.string().uuid('Please select a sprint').optional(),
});

export type UserCreateTicketFormValues = z.infer<typeof userCreateTicketSchema>;
export type StaffCreateTicketFormValues = z.infer<typeof staffCreateTicketSchema>;
export type CreateTicketFormValues = StaffCreateTicketFormValues;
export type UpdateTicketFormValues = z.infer<typeof updateTicketSchema>;

export interface CreateTicketSubmitPayload {
  values: UserCreateTicketFormValues | StaffCreateTicketFormValues;
  images: File[];
}

export const USER_TICKET_DESCRIPTION_PLACEHOLDER = `Contoh Pengisian :
Menu : Order Management
Issue : Terdapat data yang gagal terload ketika di pilih`;

export const MAX_TICKET_IMAGES = 10;

export const ACCEPTED_TICKET_IMAGE_TYPES = 'image/jpeg,image/png,image/gif,image/webp';
