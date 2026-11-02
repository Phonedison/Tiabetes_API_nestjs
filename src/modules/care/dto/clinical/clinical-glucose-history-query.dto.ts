import z from 'zod';
import { clinicalHistoryQuerySchema } from './clinical-history-query.dto.js';

export const clinicalGlucoseHistoryQuerySchema =
  clinicalHistoryQuerySchema.safeExtend({
    context: z
      .enum(['FASTING', 'PRE_MEAL', 'POST_MEAL', 'BEDTIME', 'DAWN', 'RANDOM'])
      .optional(),
  });

export type ClinicalGlucoseHistoryQueryDto = z.infer<
  typeof clinicalGlucoseHistoryQuerySchema
>;
