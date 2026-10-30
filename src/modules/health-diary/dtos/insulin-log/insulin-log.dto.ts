import z from 'zod';

export const insulinLogSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z
    .enum(['RAPID', 'ULTRA_RAPID', 'INTERMEDIATE', 'LONG_ACTING', 'ULTRA_LONG'])
    .default('RAPID'),
  brand: z.string().optional(),
});

export type InsulinLogDto = z.infer<typeof insulinLogSchema>;
