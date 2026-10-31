import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import {
  type PaginationDto,
  paginationSchema,
  ZodValidationPipe,
} from '../../../common/index.js';
import type { AuthenticatedUser } from '../../auth/auth-token.js';
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
  InsulinCatalogService,
  InsulinLogsService,
  PatientContextService,
  PatientInsulinService,
} from '../services/index.js';

type AuthenticatedRequest = FastifyRequest & { user: AuthenticatedUser };

@Controller('health-diary')
@UseGuards(JwtAuthGuard)
export class HealthDiaryController {
  constructor(
    private readonly glucoseLogService: GlucoseLogService,
    private readonly insulinCatalogService: InsulinCatalogService,
    private readonly insulinLogService: InsulinLogsService,
    private readonly patientInsulin: PatientInsulinService,
    private readonly patientContext: PatientContextService,
  ) {}

  @Post('glucose-logs')
  async createGlucoseLogs(
    @Body(new ZodValidationPipe(glucoseLogSchema)) dto: GlucoseLogDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.glucoseLogService.create(
      await this.patientContext.resolve(request.user),
      dto,
    );
  }

  @Get('insulins')
  listInsulin() {
    return this.insulinCatalogService.findMany();
  }

  @Post('insulin-logs')
  async createInsulinLog(
    @Body(new ZodValidationPipe(registerInsulinLogSchema)) dto: InsulinLogDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.insulinLogService.create(
      await this.patientContext.resolve(request.user),
      dto,
    );
  }

  @Post('patient-insulins')
  async createPatientInsulins(
    @Body(new ZodValidationPipe(patientInsulinsSchema)) dto: PatientInsulinsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.patientInsulin.create(
      await this.patientContext.resolve(request.user),
      dto,
    );
  }

  @Get('glucose-logs')
  async listGlucoseLog(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDto,
  ) {
    return this.glucoseLogService.listGlucoseLog(
      await this.patientContext.resolve(request.user),
      pagination,
    );
  }

  @Get('insulin-logs')
  async listInsulinLogs(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDto,
  ) {
    return this.insulinLogService.findManyByPatient(
      await this.patientContext.resolve(request.user),
      pagination,
    );
  }

  @Get('patient-insulins')
  async listPatientInsulins(@Req() request: AuthenticatedRequest) {
    return this.patientInsulin.findManyPatient(
      await this.patientContext.resolve(request.user),
    );
  }
}
