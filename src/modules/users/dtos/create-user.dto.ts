import { z } from 'zod';
import { user_type_enum } from '../../../generated/client/enums.js';

export const createUserSchema = z.object({
  email: z.email('E-mail inválido!').max(255),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres!')
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'A senha deve ter no máximo 72 bytes.',
    ),
  userType: z.enum(user_type_enum).default('PATIENT'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
