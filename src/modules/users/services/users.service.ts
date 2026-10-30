import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../../../generated/client/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import {
  CreateUserDto,
  type UpdatesDoctorProfileDto,
  type UpdatesPatientProfileDto,
} from '../dtos/index.js';
import { isDoctorProfile, isPatientProfile } from '../users.utils.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const userExists = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (userExists)
      throw new ConflictException('E-mail de usuário já cadastrado!');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.users.create({
        data: {
          id: randomUUID(),
          email: dto.email,
          password_hash: passwordHash,
          user_type: dto.userType,
          updated_at: new Date(),
        },
        omit: { password_hash: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ConflictException('E-mail de usuário já cadastrado!');

      throw error;
    }
  }

  async findUserByEmail(email: string) {
    const userExist = await this.prisma.users.findUnique({
      where: { email },
      omit: { password_hash: true },
    });

    if (!userExist)
      throw new NotFoundException('E-mail informado não registrado!');

    return userExist;
  }

  async findAll() {
    return this.prisma.users.findMany({
      omit: { password_hash: true },
      include: { patient_profiles: true, doctor_profiles: true },
    });
  }

  async update(
    userId: string,
    userType: 'DOCTOR' | 'PATIENT',
    changes: UpdatesDoctorProfileDto | UpdatesPatientProfileDto,
  ): Promise<void> {
    const user = await this.prisma.users.findFirst({ where: { id: userId } });

    if (!user) throw new NotFoundException('Usuário não encontrado!');

    if (user.user_type === 'PATIENT' && isPatientProfile(changes)) {
      try {
        await this.prisma.users.update({
          where: { id: userId },
          data: {
            email: changes.email,
            password_hash: changes.password,
            updated_at: new Date(),
          },
        });

        await this.prisma.patient_profiles.update({
          where: { user_id: userId },
          data: {
            full_name: changes.fullName,
            date_of_birth: changes.dateOfBirth,
            diabetes_type: changes.diabetesType,
            emergencyContactPhone: changes.emergencyContactPhone,
            updated_at: new Date(),
          },
        });
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === 'P2002')
            throw new ConflictException('E-mail já cadastrado!');
          if (error.code === 'P2025')
            throw new NotFoundException('Perfil de usuário não encontrado!');
        }
        throw error;
      }
    } else if (user.user_type === 'DOCTOR' && isDoctorProfile(changes)) {
      try {
        await this.prisma.users.update({
          where: { id: userId },
          data: {
            email: changes.email,
            password_hash: changes.password,
            updated_at: new Date(),
          },
        });

        await this.prisma.doctor_profiles.update({
          where: { user_id: userId },
          data: { full_name: changes.fullName, specialty: changes.especialty },
        });
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === 'P2002')
            throw new ConflictException('E-mail já cadastrado!');
          if (error.code === 'P2025')
            throw new NotFoundException('Perfil de usuário não encontrado!');
        }
        throw error;
      }
    }
  }
}
