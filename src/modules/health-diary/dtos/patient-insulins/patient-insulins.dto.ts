import z from 'zod';

export const patientInsulinsSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  insulinId: z.uuid(),
  defaultDosage: z.number().optional(),
  notes: z.string().max(5000).optional(),
  isActive: z.boolean(),
  createdAt: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .optional(),
});

export type PatientInsulinsDto = z.infer<typeof patientInsulinsSchema>;
