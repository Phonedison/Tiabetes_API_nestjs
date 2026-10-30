import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PaginationDto } from '../../../../common/index.js';
import { paginationMeta } from '../../../../common/index.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { insulinLogResponse, type InsulinLogDto } from '../../dtos/index.js';

@Injectable()
export class InsulinLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(patientId: string, dto: InsulinLogDto) {
    const insulin = await this.prisma.patient_insulins.findFirst({
      where: { id: dto.patientInsulinId, patient_id: patientId },
    });

    if (!insulin)
      throw new NotFoundException('Insulina não vinculada a este paciente.');

    if (!insulin.is_active)
      throw new BadRequestException('A insulina do paciente está inativa.');

    const record = await this.prisma.insulin_logs.create({
      data: {
        id: randomUUID(),
        patient_id: patientId,
        patient_insulin_id: insulin.id,
        units_applied: dto.unitApplied,
        applied_at: dto.appliedAt,
        notes: dto.notes ?? null,
      },
    });

    return insulinLogResponse(record);
  }

  async findManyByPatient(patientId: string, { page, limit }: PaginationDto) {
    const [records, totalItems] = await this.prisma.$transaction([
      this.prisma.insulin_logs.findMany({
        where: { patient_id: patientId },
        include: { patient_insulins: { include: { insulins: true } } },
        orderBy: [{ applied_at: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.insulin_logs.count({ where: { patient_id: patientId } }),
    ]);

    return {
      data: records.map((record) => ({
        ...insulinLogResponse(record),
        insulin: record.patient_insulins.insulins,
      })),
      meta: paginationMeta(totalItems, records.length, page, limit),
    };
  }
}
