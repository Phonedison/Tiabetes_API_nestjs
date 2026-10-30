import { Decimal } from '@prisma/client/runtime/client';
import { patient_insulins } from '../../../generated/client/client.js';

export class PatientInsulinEntity implements patient_insulins {
  id: string;
  patient_id: string;
  insulin_id: string;
  default_dosage: Decimal | null;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
}
