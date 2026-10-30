import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../common/index.js';
import type { AuthenticatedUser } from '../../auth/auth-token.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import {
  type CreateDoctorProfileDto,
  createDoctorSchema,
  type CreatePatientProfileDto,
  createPatientSchema,
  type CreateUserDto,
  createUserSchema,
  type UpdateProfileDto,
  updateProfileSchema,
} from '../dtos/index.js';
import { DoctorsService } from '../services/doctor.service.js';
import { PatientsService } from '../services/patients.service.js';
import { UsersService } from '../services/users.service.js';

type AuthenticatedRequest = FastifyRequest & { user: AuthenticatedUser };

const requireOwnerOrAdmin = (user: AuthenticatedUser, userId: string) => {
  if (user.userType !== 'ADMIN' && user.userId !== userId) {
    throw new ForbiddenException('Acesso não permitido.');
  }
};

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly patientService: PatientsService,
    private readonly doctorService: DoctorsService,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserSchema))
    dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  @Post('/doctor')
  @UseGuards(JwtAuthGuard)
  async createDoctorProfile(
    @Body(new ZodValidationPipe(createDoctorSchema))
    dto: CreateDoctorProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    requireOwnerOrAdmin(request.user, dto.userId);
    return this.doctorService.createDoctorProfile(dto);
  }

  @Post('/patient')
  @UseGuards(JwtAuthGuard)
  async createPatientProfile(
    @Body(new ZodValidationPipe(createPatientSchema))
    dto: CreatePatientProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    requireOwnerOrAdmin(request.user, dto.userId);
    return this.patientService.createPatientProfile(dto);
  }

  @Get('/email/:value')
  @UseGuards(JwtAuthGuard)
  async findUserByEmail(
    @Param('value', new ZodValidationPipe(z.email().max(255))) value: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (request.user.userType !== 'ADMIN' && request.user.email !== value)
      throw new ForbiddenException('Acesso não permitido.');

    return this.usersService.findUserByEmail(value);
  }

  @Get('/patient/:userId')
  @UseGuards(JwtAuthGuard)
  async findPatientIdByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    requireOwnerOrAdmin(request.user, userId);

    const patient = await this.patientService.findPatientIdByUserId(userId);

    if (!patient) throw new NotFoundException('Paciente não encontrado!');

    return patient;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() request: AuthenticatedRequest) {
    if (request.user.userType !== 'ADMIN')
      throw new ForbiddenException('Acesso restrito a administradores!');

    return this.usersService.findAll();
  }

  @Patch('/me')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateProfileSchema))
    dto: UpdateProfileDto,
  ) {
    if (request.user.userType === 'ADMIN')
      throw new ForbiddenException('Acesso restrito ao usuário!');

    return this.usersService.update(request.user.userId, dto);
  }
}
