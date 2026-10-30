import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FastifyRequest } from 'fastify';
import { type PaginationDto } from '../../../common/pagination/pagination.schema.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { AuthenticatedUser } from '../../auth/auth-token.js';
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
  PatientInsulinService,
} from '../services/index.js';

type AuthenticatedRequest = FastifyRequest & { user: AuthenticatedUser };

@Controller('health-diary')
export class HealthDiaryController {
  constructor(
    private readonly glucoseLogService: GlucoseLogService,
    private readonly insulinCatalogService: InsulinCatalogService,
    private readonly insulinLogService: InsulinLogsService,
    private readonly patientInsulin: PatientInsulinService,
  ) {}

  @Post('/glucose-logs')
  @UseGuards(JwtAuthGuard)
  async createGlucoseLogs(
    @Body(new ZodValidationPipe(glucoseLogSchema)) dto: GlucoseLogDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (request.user.userType !== 'PATIENT')
      throw new UnauthorizedException(
        'Somente pacientes podem registrar glicemias nesta rota',
      );

    const result = await this.glucoseLogService.create({
      id: randomUUID(),
      patientId: request.user.userId,
      glucoseValue: dto.glucoseValue,
      context: dto.context,
      measuredAt: dto.measuredAt,
      notes: dto.notes,
    });

    return result;
  }

  @Post('/insulins')
  @UseGuards(JwtAuthGuard)
  async listInsulin(@Req() request: AuthenticatedRequest) {
    const result = await this.insulinCatalogService.findMany();
    return result;
  }

  @Post('/insulin-logs')
  @UseGuards(JwtAuthGuard)
  async createInsulinLog(
    @Body(new ZodValidationPipe(registerInsulinLogSchema)) dto: InsulinLogDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (request.user.userType !== 'PATIENT')
      throw new ForbiddenException(
        'Somente pacientes podem cadastrar sua aplicações nesta rota!',
      );

    const result = await this.insulinLogService.create({
      id: randomUUID(),
      patientId: request.user.userId,
      patientInsulinId: dto.patientInsulinId,
      unitsApplied: dto.unitApplied,
      appliedAt: dto.appliedAt,
      notes: dto.notes,
    });

    return result;
  }

  @Post('/patient-insulins')
  @UseGuards(JwtAuthGuard)
  async createPatientInsulins(
    @Body(new ZodValidationPipe(patientInsulinsSchema)) dto: PatientInsulinsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (request.user.userType !== 'PATIENT')
      throw new ForbiddenException(
        'Somente pacientes podem cadastrar sua insulinas nesta rota!',
      );

    const { insulinId, defaultDosage, notes } = dto;

    return await this.patientInsulin.create({
      patientId: request.user.userId,
      insulinId,
      defaultDosage,
      notes,
    });
  }

  @Get('/glucose-logs')
  @UseGuards(JwtAuthGuard)
  async listGlucoseLog(
    @Req() request: AuthenticatedRequest,
    @Query() pagination: PaginationDto,
  ) {
    if (request.user.userType !== 'PATIENT')
      throw new UnauthorizedException(
        'Somente pacientes podem registrar glicemias nesta rota',
      );

    const result = await this.glucoseLogService.listGlucoseLog(
      request.user.userId,
      pagination,
    );

    return result;
  }
}
