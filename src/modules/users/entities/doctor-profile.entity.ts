import type { doctor_profiles } from '../../../generated/client/client.js';

export class DoctorProfileEntity implements doctor_profiles {
  id: string;
  user_id: string;
  full_name: string;
  crm: string;
  specialty: string | null;
  created_at: Date;
  updated_at: Date;
}
