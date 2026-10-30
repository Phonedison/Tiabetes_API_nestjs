import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { PatientInsulinsDto } from '../../dtos/index.js';

@Injectable()
export class PatientInsulinService {
  constructor(private readonly prisma: PrismaService) {}

  async create(value: PatientInsulinsDto) {
    await this.prisma.patient_insulins.create({
      data: {
        id: randomUUID(),
        patient_id: value.patientId,
        insulin_id: value.insulinId,
        default_dosage: value.defaultDosage,
        notes: value.notes,
        is_active: true,
        created_at: new Date(),
      },
    });
  }

  async findByPatientAndInsulin(patientId: string, insulinId: string) {
    const record = await this.prisma.patient_insulins.findUnique({
      where: {
        patient_id_insulin_id: {
          patient_id: patientId,
          insulin_id: insulinId,
        },
      },
    });

    if (!record) return null;

    return (
      record.id,
      {
        patientId: record.patient_id,
        insulinId: record.insulin_id,
        defaultDosage: record.default_dosage
          ? Number(record.default_dosage.toString())
          : null,
        notes: record.notes,
        isActive: record.is_active,
        createdAt: record.created_at,
      }
    );
  }

  async findByIdForPatient(id: string, patientId: string) {
    const record = await this.prisma.patient_insulins.findFirst({
      where: { id, patient_id: patientId },
    });

    if (!record) return null;

    return (
      record.id,
      {
        patientId: record.patient_id,
        insulinId: record.insulin_id,
        defaultDosage:
          record.default_dosage !== null ? Number(record.default_dosage) : null,
        notes: record.notes,
        isActive: record.is_active,
        createdAt: record.created_at,
      }
    );
  }

  async findManyPatient(patientId: string) {
    const records = await this.prisma.patient_insulins.findMany({
      where: { patient_id: patientId },
      include: { insulins: true },
      orderBy: { created_at: 'desc' },
    });

    return records.map((record) => ({
      id: record.id,
      patientId: record.patient_id,
      insulinId: record.insulin_id,
      defaultDosage:
        record.default_dosage !== null ? Number(record.default_dosage) : null,
      notes: record.notes,
      isActive: record.is_active,
      insulin: {
        id: record.insulins.id,
        name: record.insulins.name,
        category: record.insulins.category,
        brand: record.insulins.brand,
      },
    }));
  }
}
