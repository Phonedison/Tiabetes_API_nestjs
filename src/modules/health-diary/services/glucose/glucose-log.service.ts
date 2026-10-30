import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../../../../common/pagination/pagination.schema.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { type GlucoseLogDto } from '../../dtos/index.js';

interface GlucoseLogsResult {
  glucoseLogs: GlucoseLogDto[];
  total: number;
}

@Injectable()
export class GlucoseLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: GlucoseLogDto) {
    await this.prisma.glucose_logs.create({
      data: {
        id: dto.id,
        patient_id: dto.patientId,
        glucose_value: dto.glucoseValue,
        context: dto.context,
        measured_at: dto.measuredAt,
        notes: dto.notes || null,
        created_at: dto.createdAt,
      },
    });
  }

  async listGlucoseLog(patientId: string, pagination: PaginationDto) {
    const page =
      pagination.page && pagination.page > 0 ? Number(pagination.page) : 1;
    const limit =
      pagination.limit && pagination.limit > 0 ? Number(pagination.limit) : 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.glucose_logs.findMany({
        where: { patient_id: patientId },
        orderBy: { measured_at: 'desc' },
        skip,
        take,
      }),

      this.prisma.glucose_logs.count({ where: { patient_id: patientId } }),
    ]);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }
}
