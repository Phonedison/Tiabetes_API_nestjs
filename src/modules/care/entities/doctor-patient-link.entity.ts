import {
  doctor_patient,
  doctor_patient_status_enum,
} from '../../../generated/client/client.js';

export class DoctorPatientLinkEntity implements doctor_patient {
  id: string;
  doctor_id: string;
  patient_id: string;
  status: doctor_patient_status_enum;
  accepted_at: Date | null;
  revoked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
