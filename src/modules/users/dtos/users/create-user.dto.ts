import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.email('E-mail inválido!').max(255),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres!')
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'A senha deve ter no máximo 72 bytes.',
    ),
  userType: z.enum(['PATIENT', 'DOCTOR']).default('PATIENT'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
