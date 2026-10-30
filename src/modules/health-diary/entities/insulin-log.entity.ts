import { Decimal } from '@prisma/client/runtime/client';
import { insulin_logs } from '../../../generated/client/client.js';

export class InsulinLogEntity implements insulin_logs {
  id: string;
  patient_id: string;
  patient_insulin_id: string;
  units_applied: Decimal;
  applied_at: Date;
  notes: string | null;
  created_at: Date;
}
