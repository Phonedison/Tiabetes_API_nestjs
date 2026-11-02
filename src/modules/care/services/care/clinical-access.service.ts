import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class ClinicalAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveAccess(doctorId: string, patientId: string) {
    const relation = await this.prisma.doctor_patient.findFirst({
      where: { patient_id: patientId, status: 'ACTIVE', doctor_id: doctorId },
      select: { id: true, doctor_id: true, patient_id: true },
    });

    if (!relation)
      throw new NotFoundException(
        `PACIENTE :${patientId} e DOUTOR :${doctorId} não encontrado!`,
      );

    return {
      relationshipId: relation.id,
      doctorId: relation.doctor_id,
      patientId: relation.patient_id,
    };
  }
}
