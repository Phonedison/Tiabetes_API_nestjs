import { z } from 'zod';

export const DEFAULT_JWT_TTL_SECONDS = 3600;
export const jwtSecretSchema = z
  .string()
  .refine(
    (value) => Buffer.byteLength(value.trim(), 'utf8') >= 32,
    'JWT_SECRET deve conter pelo menos 32 bytes.',
  );
export const jwtExpiresInSchema = z
  .union([
    z.number().int(),
    z
      .string()
      .regex(/^\d+(?:s|m|h|d)?$/)
      .transform((value) => {
        const unit = value.slice(-1);
        const multipliers: Record<string, number> = {
          s: 1,
          m: 60,
          h: 3600,
          d: 86400,
        };
        const multiplier = multipliers[unit] ?? 1;
        return Number.parseInt(value, 10) * multiplier;
      }),
  ])
  .pipe(z.number().int().positive().max(2147483647))
  .default(DEFAULT_JWT_TTL_SECONDS);

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
    .pipe(z.number().int().min(1).max(65535))
    .default(3000),
  DATABASE_URL: z
    .url()
    .refine(
      (value) => /^postgres(?:ql)?:\/\//i.test(value),
      'DATABASE_URL deve usar PostgreSQL.',
    ),
  JWT_SECRET: jwtSecretSchema,
  JWT_EXPIRES_IN: jwtExpiresInSchema,
});
export type Environment = z.infer<typeof envSchema>;

export const validateEnvironment = (
  config: Record<string, unknown>,
): Environment => {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.'))),
    ];
    throw new Error('Variáveis de ambiente inválidas: ' + fields.join(', '));
  }
  return result.data;
};
