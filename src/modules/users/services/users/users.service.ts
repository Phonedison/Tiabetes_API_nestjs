import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../../../generated/client/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import {
  CreateUserDto,
  type UpdateProfileDto,
  updateDoctorSchema,
  updatePatientSchema,
} from '../dtos/index.js';

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

  async update(userId: string, changes: UpdateProfileDto) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('Usuário não encontrado!');

    if (user.user_type !== 'PATIENT' && user.user_type !== 'DOCTOR')
      throw new ForbiddenException('Acesso restrito ao usuário!');

    const data: Prisma.usersUpdateInput = { updated_at: new Date() };

    if (user.user_type === 'PATIENT') {
      const result = updatePatientSchema.safeParse(changes);

      if (!result.success) throw new BadRequestException(result.error.issues);

      const dto = result.data;
      data.email = dto.email;

      if (dto.password !== undefined)
        data.password_hash = await bcrypt.hash(dto.password, 10);
      if (
        [
          dto.fullName,
          dto.dateOfBirth,
          dto.diabetesType,
          dto.emergencyContactPhone,
        ].some((value) => value !== undefined)
      ) {
        data.patient_profiles = {
          update: {
            full_name: dto.fullName,
            date_of_birth:
              dto.dateOfBirth === undefined
                ? undefined
                : new Date(dto.dateOfBirth),
            diabetes_type: dto.diabetesType,
            emergency_contact_phone: dto.emergencyContactPhone,
            updated_at: new Date(),
          },
        };
      }
    } else {
      const result = updateDoctorSchema.safeParse(changes);
      if (!result.success) throw new BadRequestException(result.error.issues);

      const dto = result.data;
      data.email = dto.email;

      if (dto.password !== undefined)
        data.password_hash = await bcrypt.hash(dto.password, 10);

      if ([dto.fullName, dto.specialty].some((value) => value !== undefined))
        data.doctor_profiles = {
          update: {
            full_name: dto.fullName,
            specialty: dto.specialty,
            updated_at: new Date(),
          },
        };
    }

    try {
      return await this.prisma.users.update({
        where: { id: userId },
        data,
        omit: { password_hash: true },
        include: { patient_profiles: true, doctor_profiles: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('E-mail já cadastrado!');
        if (error.code === 'P2025')
          throw new NotFoundException('Usuário ou perfil não encontrado!');
      }
      throw error;
    }
  }
}
