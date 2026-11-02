import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default(3000),
  DATABASE_URL: z.url('A variavel DATABASE_URL precisa ser uma URL válida!'),
  JWT_SECRET: z
    .string()
    .min(10, 'O JWT_SECRET precisa ter no mínimo 10 caracteres'),
});

export type Environment = z.infer<typeof envSchema>;
