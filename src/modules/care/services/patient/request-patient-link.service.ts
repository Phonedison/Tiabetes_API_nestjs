import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class RequestPatientLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByPatient(userId: string) {
    const record = await this.prisma.doctor_patient.findMany({
      where: { patient_id: userId },
      include: { doctor_profiles: true, patient_profiles: true },
      orderBy: { created_at: 'asc' },
    });

    return record.map(({ doctor_profiles, patient_profiles }) => ({
      doctor: {
        id: doctor_profiles.id,
        userId: doctor_profiles.user_id,
        fullName: doctor_profiles.full_name,
        crm: doctor_profiles.crm,
        specialty: doctor_profiles.specialty,
      },
      patient: {
        id: patient_profiles.id,
        userId: patient_profiles.user_id,
        fullName: patient_profiles.full_name,
        diabetesType: patient_profiles.diabetes_type,
        targetGlucoseMin: patient_profiles.target_glucose_min,
        targetGlucoseMax: patient_profiles.target_glucose_max,
      },
    }));
  }
}
