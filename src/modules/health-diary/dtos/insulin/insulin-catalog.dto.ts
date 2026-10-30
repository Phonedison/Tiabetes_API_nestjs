import z from 'zod';

export const insulinsSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z
    .enum(['RAPID', 'ULTRA_RAPID', 'INTERMEDIATE', 'LONG_ACTING', 'ULTRA_LONG'])
    .default('RAPID'),
  brand: z.string().optional(),
});

export type InsulinsDto = z.infer<typeof insulinsSchema>;
