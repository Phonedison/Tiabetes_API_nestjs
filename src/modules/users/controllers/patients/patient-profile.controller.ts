import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../../common/decorators/roles.decorator.js';
import { ZodValidationPipe } from '../../../../common/index.js';
import { RolesGuard } from '../../../auth/guards/roles/roles.guard.js';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard.js';
import {
  type CreatePatientProfileDto,
  createPatientSchema,
} from '../../dtos/index.js';
import { PatientsService } from '../../services/index.js';

@Controller('users')
export class PatientProfileController {
  constructor(private readonly patientService: PatientsService) {}

  @Get('/patient/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findPatientIdByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    const patient = await this.patientService.findPatientIdByUserId(userId);
    if (!patient) throw new NotFoundException('Paciente não encontrado!');

    return patient;
  }

  @Post('/patient')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT')
  async createPatientProfile(
    @Body(new ZodValidationPipe(createPatientSchema))
    dto: CreatePatientProfileDto,
  ) {
    return this.patientService.createPatientProfile(dto);
  }
}
