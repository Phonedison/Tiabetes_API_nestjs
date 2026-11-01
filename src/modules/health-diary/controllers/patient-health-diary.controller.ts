import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-uer.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  type PaginationDto,
  paginationSchema,
  ZodValidationPipe,
} from '../../../common/index.js';
import { RolesGuard } from '../../auth/guards/roles/roles.guard.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import {
  type GlucoseLogDto,
  glucoseLogSchema,
  type InsulinLogDto,
  type PatientInsulinsDto,
  patientInsulinsSchema,
  registerInsulinLogSchema,
} from '../dtos/index.js';
import {
  GlucoseLogService,
  InsulinLogsService,
  PatientInsulinService,
} from '../services/index.js';

@Controller('/health-diary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PATIENT')
export class PatientHealthDiaryController {
  constructor(
    private readonly glucoseLogService: GlucoseLogService,
    private readonly insulinLogService: InsulinLogsService,
    private readonly patientInsulin: PatientInsulinService,
  ) {}

  @Get('glucose-logs')
  async listGlucoseLog(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDto,
  ) {
    return this.glucoseLogService.listGlucoseLog(userId, pagination);
  }

  @Get('insulin-logs')
  async listInsulinLogs(
    @CurrentUser('userId') userId: string,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDto,
  ) {
    return this.insulinLogService.findManyByPatient(userId, pagination);
  }

  @Get('patient-insulins')
  async listPatientInsulins(@CurrentUser('userId') userId: string) {
    return this.patientInsulin.findManyPatient(userId);
  }

  @Post('glucose-logs')
  async createGlucoseLogs(
    @Body(new ZodValidationPipe(glucoseLogSchema)) dto: GlucoseLogDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.glucoseLogService.create(userId, dto);
  }

  @Post('patient-insulins')
  async createPatientInsulins(
    @Body(new ZodValidationPipe(patientInsulinsSchema)) dto: PatientInsulinsDto,
    @CurrentUser() userId: string,
  ) {
    return this.patientInsulin.create(userId, dto);
  }

  @Post('insulin-logs')
  async createInsulinLog(
    @Body(new ZodValidationPipe(registerInsulinLogSchema)) dto: InsulinLogDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.insulinLogService.create(userId, dto);
  }
}
