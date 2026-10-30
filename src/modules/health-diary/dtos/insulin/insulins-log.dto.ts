import { z } from 'zod';
import { insulin_logs } from '../../../../generated/client/client.js';

export const registerInsulinLogSchema = z.strictObject({
  patientInsulinId: z.uuid(),
  unitApplied: z.number().positive().max(9999.99).multipleOf(0.01),
  appliedAt: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value)),
  notes: z.string().trim().max(1000).nullish(),
});

export type InsulinLogDto = z.infer<typeof registerInsulinLogSchema>;

export const insulinLogResponse = (record: insulin_logs) => ({
  id: record.id,
  patientId: record.patient_id,
  patientInsulinId: record.patient_insulin_id,
  unitsApplied: Number(record.units_applied),
  appliedAt: record.applied_at,
  notes: record.notes,
  createdAt: record.created_at,
});
