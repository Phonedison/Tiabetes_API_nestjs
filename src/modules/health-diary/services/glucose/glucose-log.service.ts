import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PaginationDto } from '../../../../common/pagination/pagination.schema.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { GlucoseLogDto } from '../../dtos/index.js';
import { glucoseLogResponse, paginationMeta } from '../diary-mappers.js';

@Injectable()
export class GlucoseLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(patientId: string, dto: GlucoseLogDto) {
    const record = await this.prisma.glucose_logs.create({
      data: {
        id: randomUUID(),
        patient_id: patientId,
        glucose_value: dto.glucoseValue,
        context: dto.context,
        measured_at: dto.measuredAt,
        notes: dto.notes ?? null,
      },
    });
    return glucoseLogResponse(record);
  }

  async listGlucoseLog(patientId: string, { page, limit }: PaginationDto) {
    const [records, totalItems] = await this.prisma.$transaction([
      this.prisma.glucose_logs.findMany({
        where: { patient_id: patientId },
        orderBy: [{ measured_at: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.glucose_logs.count({ where: { patient_id: patientId } }),
    ]);
    return {
      data: records.map(glucoseLogResponse),
      meta: paginationMeta(totalItems, records.length, page, limit),
    };
  }
}
