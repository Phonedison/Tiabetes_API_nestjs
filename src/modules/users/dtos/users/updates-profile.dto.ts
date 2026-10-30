import z from 'zod';

const common = {
  email: z.email().max(255).optional(),
  password: z
    .string()
    .min(8)
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'A senha deve ter no máximo 72 bytes.',
    )
    .optional(),
  fullName: z.string().trim().min(3).max(255).optional(),
};

export const updateDoctorSchema = z
  .strictObject({
    ...common,
    specialty: z.string().trim().min(1).max(100).nullable().optional(),
  })
  .refine(
    (body) => Object.values(body).some((value) => value !== undefined),
    'Informe ao menos um campo!',
  );

export const updatePatientSchema = z
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
export type UpdatesPatientProfileDto = z.infer<typeof updatePatientSchema>;
export const updateProfileSchema = z.union([
  updateDoctorSchema,
  updatePatientSchema,
]);
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
