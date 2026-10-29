import { z } from 'zod';

export const createDoctorSchema = z.object({
  userId: z.string(),
  email: z.email(),
  password: z
    .string()
    .min(8, 'A senha deve possuir pelo menos 8 caracteres.')
    .max(128),
  fullName: z
    .string()
    .min(8, 'Nome deve possuir pelo menos 3 caracteres.')
    .max(255),
  crm: z.string().min(4).max(30),
  specialty: z.string().max(100).optional(),
});

export type CreateDoctorProfileDto = z.infer<typeof createDoctorSchema>;
