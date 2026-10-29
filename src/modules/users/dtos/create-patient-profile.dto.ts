import { z } from 'zod';

export const createPatientSchema = z.object({
  userId: z.string(),
  email: z.email(),
  password: z
    .string()
    .min(8, 'A senha deve possuir pelo menos 8 caracteres.')
    .max(128),
  fullName: z
    .string()
    .min(3, 'Nome deve possuir pelo menos 3 caracteres.')
    .max(255),
  dateOfBirth: z.coerce.date(),
  diabetesType: z.enum([
    'TYPE_1',
    'TYPE_2',
    'GESTATIONAL',
    'LADA',
    'MODY',
    'OTHER',
  ]),
  emergencyContactPhone: z.string().max(20).optional(),
});

export type CreatePatientProfileDto = z.infer<typeof createPatientSchema>;
