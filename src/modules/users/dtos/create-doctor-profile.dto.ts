import { z } from 'zod';

export const createDoctorSchema = z.object({
  userId: z.uuid(),
  fullName: z
    .string()
    .min(3, 'Nome deve possuir pelo menos 3 caracteres.')
    .max(255),
  crm: z.string().min(4).max(30),
  specialty: z.string().max(100).nullish(),
  updated_at: z.date().optional(),
});

export type CreateDoctorProfileDto = z.infer<typeof createDoctorSchema>;
