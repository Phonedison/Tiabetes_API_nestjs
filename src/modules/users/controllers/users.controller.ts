import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import {
  type CreateDoctorProfileDto,
  createDoctorSchema,
  type CreatePatientProfileDto,
  createPatientSchema,
  type CreateUserDto,
  createUserSchema,
} from '../dtos/index.js';
import { DoctorsService } from '../services/doctor.service.js';
import { PatientsService } from '../services/patients.service.js';
import { UsersService } from '../services/users.service.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly patientService: PatientsService,
    private readonly doctorService: DoctorsService,
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createUserSchema))
    dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  @Post('/doctor')
  async createDoctorProfile(
    @Body(new ZodValidationPipe(createDoctorSchema))
    dto: CreateDoctorProfileDto,
  ) {
    return this.doctorService.createDoctorProfile(dto);
  }

  @Post('/patient')
  async createPatientProfile(
    @Body(new ZodValidationPipe(createPatientSchema))
    dto: CreatePatientProfileDto,
  ) {
    return this.patientService.createPatientProfile(dto);
  }

  @Get('/email/:value')
  async findUserByEmail(@Param('value') value: string) {
    return this.usersService.findUserByEmail(value);
  }

  @Get('/patient/:userId')
  async findPatientIdByUserId(@Param('userId') userId: string) {
    const patient = this.patientService.findPatientIdByUserId(userId);
    if (!patient) throw new NotFoundException('Paciente não encontrado!');
    return patient;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
