import z from 'zod';

const optionalData = z.iso
  .datetime({
    offset: true,
  })
  .transform((v) => new Date(v))
  .optional();

export const clinicalHistoryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
    from: optionalData,
    to: optionalData,
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    path: ['from'],
    message: 'A data inicial não pode ser posterior à data final!',
  });

export type ClinicalHistoryQueryDto = z.infer<
  typeof clinicalHistoryQuerySchema
>;
