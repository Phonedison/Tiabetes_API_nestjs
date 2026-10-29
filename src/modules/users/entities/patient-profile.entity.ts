import type { patient_profiles } from '../../../generated/client/client.js';

export class PatientProfileEntity implements patient_profiles {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: Date;
  diabetes_type: patient_profiles['diabetes_type'];
  target_glucose_min: number;
  target_glucose_max: number;
  emergency_contact_phone: string | null;
  created_at: Date;
  updated_at: Date;
}
