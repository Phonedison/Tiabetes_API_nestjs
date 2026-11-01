import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/auth-token.js';
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
  PatientContextService,
} from '../services/index.js';

@Controller('/health-diary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PATIENT')
export class PatientHealthDiaryController {
  constructor(
    private readonly glucoseLogService: GlucoseLogService,
    private readonly insulinLogService: InsulinLogsService,
    private readonly patientInsulin: PatientInsulinService,
    private readonly patientContext: PatientContextService,
  ) {}

  @Get('glucose-logs')
  async listGlucoseLog(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDto,
  ) {
    return this.glucoseLogService.listGlucoseLog(
      await this.patientContext.resolve(user),
      pagination,
    );
  }

  @Get('insulin-logs')
  async listInsulinLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDto,
  ) {
    return this.insulinLogService.findManyByPatient(
      await this.patientContext.resolve(user),
      pagination,
    );
  }

  @Get('patient-insulins')
  async listPatientInsulins(@CurrentUser() user: AuthenticatedUser) {
    return this.patientInsulin.findManyPatient(
      await this.patientContext.resolve(user),
    );
  }

  @Post('glucose-logs')
  async createGlucoseLogs(
    @Body(new ZodValidationPipe(glucoseLogSchema)) dto: GlucoseLogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.glucoseLogService.create(
      await this.patientContext.resolve(user),
      dto,
    );
  }

  @Post('patient-insulins')
  async createPatientInsulins(
    @Body(new ZodValidationPipe(patientInsulinsSchema)) dto: PatientInsulinsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.patientInsulin.create(
      await this.patientContext.resolve(user),
      dto,
    );
  }

  @Post('insulin-logs')
  async createInsulinLog(
    @Body(new ZodValidationPipe(registerInsulinLogSchema)) dto: InsulinLogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.insulinLogService.create(
      await this.patientContext.resolve(user),
      dto,
    );
  }
}
