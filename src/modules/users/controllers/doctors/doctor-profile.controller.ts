import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  Roles,
  ZodValidationPipe,
} from '../../../../common/index.js';
import { RolesGuard } from '../../../auth/guards/roles/roles.guard.js';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard.js';
import {
  type CreateDoctorProfileDto,
  createDoctorSchema,
} from '../../dtos/index.js';
import { DoctorsService } from '../../services/doctors/doctor.service.js';

@Controller('users')
export class DoctorProfileController {
  constructor(private readonly doctorService: DoctorsService) {}

  @Post('/doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  async createDoctorProfile(
    @Body(new ZodValidationPipe(createDoctorSchema))
    dto: CreateDoctorProfileDto,
    @CurrentUser('userId') userId: string,
  ) {
    if (dto.userId !== userId)
      throw new ForbiddenException('Acesso não permitido.');
    return this.doctorService.create(dto);
  }
}
