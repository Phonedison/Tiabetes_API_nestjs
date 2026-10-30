import z from 'zod';

export const glucoseLogSchema = z.object({
  id: z.uuid(),
  patient_id: z.uuid(),
  glucose_value: z.number().int(),
  context: z
    .enum(['FASTING', 'PRE_MEAL', 'POST_MEAL', 'BEDTIME', 'DAWN', 'RANDOM'])
    .default('FASTING'),
  measuredAt: z.iso.datetime(),
  notes: z.string().trim().max(5000).optional(),
  createdAt: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .optional(),
});

export type GlucoseLogDto = z.infer<typeof glucoseLogSchema>;
