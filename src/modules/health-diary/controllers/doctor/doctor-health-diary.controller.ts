import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  paginationSchema,
  Roles,
  ZodValidationPipe,
  type PaginationDto,
} from '../../../common/index.js';
import { RolesGuard } from '../../auth/guards/roles/roles.guard.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { GlucoseLogService, PatientContextService } from '../services/index.js';

@Controller('/health-diary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class DoctorHealthDiaryController {
  constructor(
    private readonly glucoseLogService: GlucoseLogService,
    private readonly patientContext: PatientContextService,
  ) {}

  @Get('patients/:patientId/glucose-logs')
  async getGlucoseLogs(
    @Param('patientId', new ParseUUIDPipe()) patientId: string,
    @CurrentUser('userId') userId: string,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDto,
  ) {
    await this.patientContext.assertDoctorAccess(userId, patientId);
    return this.glucoseLogService.listGlucoseLog(patientId, pagination);
  }
}
