import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../../../../common/pagination/pagination.schema.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { InsulinLogDto } from '../../dtos/index.js';

@Injectable()
export class InsulinLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(insulin: InsulinLogDto) {
    await this.prisma.insulin_logs.create({
      data: {
        id: insulin.id,
        patient_id: insulin.patientId,
        patient_insulin_id: insulin.patientInsulinId,
        units_applied: insulin.unitsApplied,
        applied_at: insulin.appliedAt,
        notes: insulin.notes,
        created_at: new Date(),
      },
    });
  }
  async findManyByPatient(patientId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.insulin_logs.findMany({
        where: { patient_id: patientId },
        include: { patient_insulins: { include: { insulins: true } } },
        orderBy: { applied_at: 'desc' },
        skip,
        take,
      }),
      this.prisma.insulin_logs.count({ where: { patient_id: patientId } }),
    ]);

    const insulinLogs = data.map((record) => ({
      log:
        (record.id,
        {
          patientId: record.patient_id,
          patientInsulinId: record.patient_insulin_id,
          unitsApplied: Number(record.units_applied.toString()),
          appliedAt: record.applied_at,
          notes: record.notes,
          createdAt: record.created_at,
        }),
      insulin: {
        id: record.patient_insulins.insulins.id,
        name: record.patient_insulins.insulins.name,
        category: record.patient_insulins.insulins.category,
        brand: record.patient_insulins.insulins.brand,
      },
    }));

    return {
      insulinLogs,
      totalItems,
    };
  }
}
