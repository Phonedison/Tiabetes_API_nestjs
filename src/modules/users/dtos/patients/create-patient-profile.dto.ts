import { z } from 'zod';
import { diabetes_type_enum } from '../../../../generated/client/enums.js';

export const createPatientSchema = z.object({
  userId: z.uuid(),
  fullName: z
    .string()
    .min(3, 'Nome deve possuir pelo menos 3 caracteres.')
    .max(255),
  dateOfBirth: z.iso.date().transform((value) => new Date(value)),
  diabetesType: z.enum(diabetes_type_enum),
  emergencyContactPhone: z.string().max(20).nullish(),
});

export type CreatePatientProfileDto = z.infer<typeof createPatientSchema>;
