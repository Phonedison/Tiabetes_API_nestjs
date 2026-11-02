import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class RequestDoctorLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCrm(crm: string) {
    const doctor = await this.prisma.doctor_profiles.findUnique({
      where: { crm: crm.trim().toUpperCase() },
    });

    if (!doctor) throw new NotFoundException('Doctor não encontrado!');

    return {
      id: doctor.id,
      userId: doctor.user_id,
      fullName: doctor.full_name,
      crm,
      specialty: doctor.specialty,
    };
  }

  async findByUserId(userId: string) {
    const doctor = await this.prisma.doctor_profiles.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    return doctor?.id ?? null;
  }

  async findManyPatientsByDoctor(userId: string) {
    const record = await this.prisma.doctor_patient.findMany({
      where: { doctor_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        patient_profiles: {
          select: {
            id: true,
            user_id: true,
            full_name: true,
            diabetes_type: true,
            target_glucose_min: true,
            target_glucose_max: true,
          },
        },
      },
    });

    return record.map(async ({ patient_profiles }) => ({
      id: patient_profiles.id,
      userId: patient_profiles.user_id,
      fullName: patient_profiles?.full_name,
      diabetesType: patient_profiles?.diabetes_type,
      targetGlucoseMin: patient_profiles?.target_glucose_min,
      targetGlucoseMax: patient_profiles?.target_glucose_max,
    }));
  }

  async findActivePacientsByDoctor(userId: string) {
    const record = await this.prisma.doctor_patient.findMany({
      where: { status: 'ACTIVE', doctor_id: userId },
      include: { patient_profiles: true },
      orderBy: { patient_profiles: { full_name: 'asc' } },
    });

    return record.map(async ({ patient_profiles }) => ({
      id: patient_profiles.id,
      userId: patient_profiles.user_id,
      fullName: patient_profiles.full_name,
      diabetesType: patient_profiles.diabetes_type,
      targetGlucoseMin: patient_profiles.target_glucose_min,
      targetGlucoseMax: patient_profiles.target_glucose_max,
    }));
  }
}
