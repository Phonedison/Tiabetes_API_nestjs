import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(1)
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'A senha deve ter no máximo 72 bytes.',
  );

const emailSchema = z.email().max(255);

export const loginSchema = z.union([
  z.strictObject({
    email: emailSchema,
    password: passwordSchema,
  }),
  z
    .strictObject({
      email: emailSchema,
      pass: passwordSchema,
    })
    .transform(({ email, pass }) => ({ email, password: pass })),
]);

export type LoginDto = z.infer<typeof loginSchema>;
