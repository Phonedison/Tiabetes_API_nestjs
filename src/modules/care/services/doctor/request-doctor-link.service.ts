import { Injectable, NotFoundException } from '@nestjs/common';
import {
  createPaginationMeta,
  PaginationDto,
} from '../../../../common/index.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { qtdPatientResponse } from '../../dto/index.js';

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

  async findManyPatients(userId: string, { page, limit }: PaginationDto) {
    const [records, totalItems] = await this.prisma.$transaction([
      this.prisma.doctor_patient.findMany({
        where: { doctor_id: userId },
        orderBy: { created_at: 'desc' },
        include: { patient_profiles: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.doctor_patient.count({ where: { doctor_id: userId } }),
    ]);

    return {
      data: records.map(qtdPatientResponse),
      meta: createPaginationMeta(totalItems, page, limit, records.length),
    };
  }

  async findActivePacients(userId: string, { page, limit }: PaginationDto) {
    const [records, totalItems] = await this.prisma.$transaction([
      this.prisma.doctor_patient.findMany({
        where: { status: 'ACTIVE', doctor_id: userId },
        include: { patient_profiles: true },
        orderBy: { patient_profiles: { full_name: 'asc' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.doctor_patient.count({
        where: { doctor_id: userId, status: 'ACTIVE' },
      }),
    ]);

    return {
      data: records.map(qtdPatientResponse),
      meta: createPaginationMeta(totalItems, page, limit, records.length),
    };
  }
}
