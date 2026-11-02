import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class ClinicalRelationService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDoctorAndPatient(doctorId: string, patientId: string) {
    const record = await this.prisma.doctor_patient.findUnique({
      where: {
        doctor_id_patient_id: {
          doctor_id: doctorId,
          patient_id: patientId,
        },
      },
    });

    if (!record)
      throw new NotFoundException(
        'Relação entre médico e paciente não encontrado!',
      );

    return;
  }

  async findById(id: string) {
    const existRelation = await this.prisma.doctor_patient.findFirst({
      where: { id },
    });

    if (!existRelation)
      throw new NotFoundException(
        'Relação entre médico e paciente não encontrado! ',
      );

    return existRelation;
  }

  async create(doctorId: string, patientId: string) {
    const isExist = await this.prisma.doctor_patient.findFirst({
      where: { doctor_id: doctorId, patient_id: patientId },
    });

    if (isExist)
      throw new NotAcceptableException(
        'Vinculo entre médico e paciente encontrado!',
      );

    const now = new Date();
    return await this.prisma.doctor_patient.create({
      data: {
        id: randomUUID(),
        patient_id: patientId,
        doctor_id: doctorId,
        status: 'PENDING',
        accepted_at: null,
        revoked_at: null,
        created_at: now,
        updated_at: now,
      },
    });
  }

  async accept(id: string) {
    const exist = await this.findById(id);

    const now = new Date();

    if (exist)
      await this.prisma.doctor_patient.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          accepted_at: now,
          revoked_at: null,
          updated_at: now,
        },
      });
  }

  async revoke(id: string) {
    const existRelation = await this.findById(id);

    if (existRelation.status === 'REVOKED') return null;

    const now = new Date();
    await this.prisma.doctor_patient.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        accepted_at: now,
        revoked_at: null,
        updated_at: now,
      },
    });
  }

  async requestAgain(id: string) {
    const existRelation = await this.findById(id);

    if (existRelation.status !== 'REVOKED')
      throw new NotAcceptableException(
        'Somente vínculos revogados podem ser solicitados novamente!',
      );

    const now = new Date();
    await this.prisma.doctor_patient.update({
      where: { id },
      data: {
        status: 'PENDING',
        accepted_at: null,
        revoked_at: null,
        updated_at: now,
      },
    });
  }
}
