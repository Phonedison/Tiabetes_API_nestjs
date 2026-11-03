import { Prisma } from '@prisma/client';
import z from 'zod';

type DoctorPatientWithProfile = Prisma.doctor_patientGetPayload<{
  include: { patient_profiles: true };
}>;

export const requestDoctorLinkSchema = z.object({
  doctorCrm: z.string().trim().min(4).max(30),
});

export type RequestDoctorLinkDto = z.infer<typeof requestDoctorLinkSchema>;

export const qtdPatientResponse = (record: DoctorPatientWithProfile) => ({
  id: record.patient_profiles.id,
  userId: record.patient_profiles.user_id,
  fullName: record.patient_profiles.full_name,
  diabetesType: record.patient_profiles.diabetes_type,
  targetGlucoseMin: record.patient_profiles.target_glucose_min,
  targetGlucoseMax: record.patient_profiles.target_glucose_max,
});
