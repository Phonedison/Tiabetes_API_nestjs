import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../auth/guards/roles/roles.guard.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { GlucoseLogService } from '../services/index.js';

@Controller('/health-diary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class DoctorHealthDiaryController {
  constructor(private readonly glucoseLogService: GlucoseLogService) {}

  @Get('patients/:patientId/glucose-logs')
  async getGlucoseLogs(@Param('patientId') patientId: string) {
    return this.glucoseLogService.listGlucoseLog(patientId, {
      page: 1,
      limit: 10,
    });
  }
}
