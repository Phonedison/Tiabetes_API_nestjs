import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../../../generated/client/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateDoctorProfileDto } from '../dtos/create-doctor-profile.dto.js';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDoctorProfile(dto: CreateDoctorProfileDto) {
    const doctor = await this.prisma.users.findUnique({
      where: { id: dto.userId },
    });

    if (!doctor) throw new NotFoundException('Usuário base não encontrado.');
    if (doctor.user_type !== 'DOCTOR')
      throw new BadRequestException(
        'Tipo de usuário incompatível com o perfil.',
      );

    try {
      return await this.prisma.doctor_profiles.create({
        data: {
          id: randomUUID(),
          user_id: dto.userId,
          full_name: dto.fullName,
          crm: dto.crm.trim().toLocaleUpperCase(),
          specialty: dto.specialty,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Perfil ou CRM já cadastrado.');
        if (error.code === 'P2003')
          throw new NotFoundException('Usuário base não encontrado.');
      }
      throw error;
    }
  }

  async findDoctorIdByUserId(userId: string) {
    const doctor = await this.prisma.doctor_profiles.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!doctor) return null;
    return doctor;
  }

  async findAll() {
    return this.prisma.doctor_profiles.findMany({
      include: { users: { omit: { password_hash: true } } },
    });
  }
}
