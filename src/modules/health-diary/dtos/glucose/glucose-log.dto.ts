import { z } from 'zod';
import { glucose_logs } from '../../../../generated/client/client.js';
import { glucose_context_enum } from '../../../../generated/client/enums.js';

export const glucoseLogSchema = z.strictObject({
  glucoseValue: z.number().int().positive().max(2147483647),
  context: z.enum(glucose_context_enum).default('FASTING'),
  measuredAt: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value)),
  notes: z.string().trim().max(5000).nullish(),
});

export const glucoseLogResponse = (record: glucose_logs) => ({
  id: record.id,
  patientId: record.patient_id,
  glucoseValue: record.glucose_value,
  context: record.context,
  measuredAt: record.measured_at,
  notes: record.notes,
  createdAt: record.created_at,
});

export type GlucoseLogDto = z.infer<typeof glucoseLogSchema>;
