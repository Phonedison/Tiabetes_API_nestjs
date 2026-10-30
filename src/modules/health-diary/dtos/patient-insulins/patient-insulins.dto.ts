import z from 'zod';

export const patientInsulinsSchema = z.object({
  id: z.uuid(),
  patient_id: z.uuid(),
  insulin_id: z.uuid(),
  default_dosage: z.number().optional(),
  notes: z.string().max(5000).optional(),
  is_active: z.boolean(),
  created_at: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .optional(),
});

export type PatientInsulinsDto = z.infer<typeof patientInsulinsSchema>;
