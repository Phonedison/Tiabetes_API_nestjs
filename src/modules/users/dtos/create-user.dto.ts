import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.email('E-mail inválido!'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres!'),
  userType: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).default('PATIENT'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
