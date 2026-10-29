import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreatePatientProfileDto } from '../dtos/create-patient-profile.dto.js';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPatientProfile(dto: CreatePatientProfileDto) {
    const patient = await this.prisma.user.findUnique({
      where: { userId: dto.userId },
    });

    if (!patient) throw new NotFoundException('Usuário base não encontrado.');

    return this.prisma.pati.create({
      data: {
        userId: dto.userId,
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth,
        diabetesType: dto.diabetesType,
        emergencyContactPhone: dto.emergencyContactPhone,
        createdAt: Date.now(),
      },
    });
  }

  async findAll() {
    return this.prisma.PatientProfile.findMany({
      include: { user: true },
    });
  }
}
