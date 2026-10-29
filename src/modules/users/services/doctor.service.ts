// src/modules/users/services/doctors.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateDoctorProfileDto } from '../dtos/create-doctor-profile.dto.js';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDoctorProfile(dto: CreateDoctorProfileDto) {
    const doctor = await this.prisma.user.findUnique({
      where: { userId: dto.userId },
    });

    if (!doctor) throw new NotFoundException('Usuário base não encontrado.');

    return this.prisma.doctorProfile.create({
      data: {
        userId: dto.userId,
        fullName: dto.fullName,
        crm: dto.crm,
        specialty: dto.specialty,
        createdAt: Date.now(),
      },
    });
  }

  async findAll() {
    return this.prisma.doctorProfile.findMany({
      include: { user: true },
    });
  }
}
