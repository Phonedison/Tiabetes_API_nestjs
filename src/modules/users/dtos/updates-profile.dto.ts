import z from 'zod';

const common = {
  email: z.email().max(255).optional(),
  password: z.string().min(8).max(128).optional(),
  fullName: z.string().trim().min(3).max(255).optional(),
};

export const updateDoctorSchema = z
  .strictObject({
    ...common,
    especialty: z.string().trim().min(1).max(100).nullable().optional(),
  })
  .refine(
    (body) => Object.values(body).some((value) => value !== undefined),
    'Informe ao menos um campo!',
  );

export const updadatePatientSchema = z
  .strictObject({
    ...common,
    dateOfBirth: z.iso
      .date()
      .refine(
        (value) => value <= new Date().toISOString().slice(0, 10),
        'Data de nascimento inválido!',
      )
      .optional(),
    diabetesType: z
      .enum(['TYPE_1', 'TYPE_2', 'GESTATIONAL', 'LADA', 'MODY', 'OTHER'])
      .optional(),
    emergencyContactPhone: z
      .string()
      .trim()
      .min(1)
      .max(20)
      .nullable()
      .optional(),
  })
  .refine(
    (body) => Object.values(body).some((value) => value !== undefined),
    'Informe ao menos um dos campos!',
  );

export type UpdatesDoctorProfileDto = z.infer<typeof updateDoctorSchema>;
export type UpdatesPatientProfileDto = z.infer<typeof updadatePatientSchema>;
