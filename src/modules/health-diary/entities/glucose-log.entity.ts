import {
  glucose_context_enum,
  glucose_logs,
} from '../../../generated/client/client.js';

export class GlucoseLogEntity implements glucose_logs {
  id: string;
  patient_id: string;
  glucose_value: number;
  context: glucose_context_enum;
  measured_at: Date;
  notes: string | null;
  created_at: Date;
}
