import z from 'zod';

export const patientInsulinsSchema = z.object({
  patientId: z.uuid(),
  insulinId: z.uuid(),
  defaultDosage: z.coerce
    .number()
    .min(0, 'O valor não pode ser negativo')
    .optional(),
  notes: z.string().max(5000).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .optional(),
});

export type PatientInsulinsDto = z.infer<typeof patientInsulinsSchema>;
