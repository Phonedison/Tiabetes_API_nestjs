import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../../../../generated/client/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  patientInsulinResponse,
  type PatientInsulinsDto,
} from '../../dtos/index.js';

@Injectable()
export class PatientInsulinService {
  constructor(private readonly prisma: PrismaService) {}

  async create(patientId: string, value: PatientInsulinsDto) {
    const insulin = await this.prisma.insulins.findUnique({
      where: { id: value.insulinId },
    });

    if (!insulin) throw new NotFoundException('Insulina não encontrada.');

    try {
      const record = await this.prisma.patient_insulins.create({
        data: {
          id: randomUUID(),
          patient_id: patientId,
          insulin_id: value.insulinId,
          default_dosage: value.defaultDosage ?? null,
          notes: value.notes ?? null,
        },
      });

      return patientInsulinResponse(record);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Insulina já vinculada ao paciente.');
        if (error.code === 'P2003')
          throw new NotFoundException('Paciente ou insulina não encontrado.');
      }
      throw error;
    }
  }

  async findByPatientAndInsulin(patientId: string, insulinId: string) {
    const record = await this.prisma.patient_insulins.findUnique({
      where: {
        patient_id_insulin_id: { patient_id: patientId, insulin_id: insulinId },
      },
    });

    return record ? patientInsulinResponse(record) : null;
  }

  async findByIdForPatient(id: string, patientId: string) {
    const record = await this.prisma.patient_insulins.findFirst({
      where: { id, patient_id: patientId },
    });

    return record ? patientInsulinResponse(record) : null;
  }

  async findManyPatient(patientId: string) {
    const records = await this.prisma.patient_insulins.findMany({
      where: { patient_id: patientId },
      include: { insulins: true },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });

    return records.map((record) => ({
      ...patientInsulinResponse(record),
      insulin: record.insulins,
    }));
  }
}
