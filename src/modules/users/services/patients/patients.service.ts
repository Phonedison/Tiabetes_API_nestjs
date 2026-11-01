import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../../../generated/client/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreatePatientProfileDto } from '../dtos/create-patient-profile.dto.js';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPatientProfile(dto: CreatePatientProfileDto) {
    const patient = await this.prisma.users.findUnique({
      where: { id: dto.userId },
    });

    if (!patient) throw new NotFoundException('Usuário base não encontrado.');

    if (patient.user_type !== 'PATIENT')
      throw new BadRequestException(
        'Tipo de usuário incompatível com o perfil.',
      );

    try {
      return await this.prisma.patient_profiles.create({
        data: {
          id: randomUUID(),
          user_id: dto.userId,
          full_name: dto.fullName,
          date_of_birth: dto.dateOfBirth,
          diabetes_type: dto.diabetesType,
          emergency_contact_phone: dto.emergencyContactPhone,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Perfil já cadastrado.');
        if (error.code === 'P2003')
          throw new NotFoundException('Usuário base não encontrado.');
      }
      throw error;
    }
  }

  async findPatientIdByUserId(userId: string) {
    const patient = await this.prisma.patient_profiles.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!patient) return null;
    return patient;
  }

  async findAll() {
    return this.prisma.patient_profiles.findMany({
      include: { users: { omit: { password_hash: true } } },
    });
  }
}
