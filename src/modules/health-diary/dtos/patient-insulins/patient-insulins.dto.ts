import { z } from 'zod';
import { patient_insulins } from '../../../../generated/client/client.js';

export const patientInsulinsSchema = z.strictObject({
  insulinId: z.uuid(),
  defaultDosage: z
    .number()
    .nonnegative()
    .max(9999.99)
    .multipleOf(0.01)
    .nullish(),
  notes: z.string().trim().max(5000).nullish(),
});

export type PatientInsulinsDto = z.infer<typeof patientInsulinsSchema>;

export const patientInsulinResponse = (record: patient_insulins) => ({
  id: record.id,
  patientId: record.patient_id,
  insulinId: record.insulin_id,
  defaultDosage:
    record.default_dosage === null ? null : Number(record.default_dosage),
  notes: record.notes,
  isActive: record.is_active,
  createdAt: record.created_at,
});
