import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  Roles,
  ZodValidationPipe,
} from '../../../../common/index.js';
import type { AuthenticatedUser } from '../../../auth/auth-token.js';
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
  @Roles('PATIENT', 'ADMIN')
  async findPatientIdByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.userType !== 'ADMIN' && user.userId !== userId) {
      throw new ForbiddenException('Acesso não permitido.');
    }
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
    @CurrentUser('userId') userId: string,
  ) {
    if (dto.userId !== userId)
      throw new ForbiddenException('Acesso não permitido.');
    return this.patientService.createPatientProfile(dto);
  }
}
