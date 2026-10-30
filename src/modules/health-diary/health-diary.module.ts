import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { HealthDiaryController } from './controllers/health-diary.controller.js';
import {
  GlucoseLogService,
  InsulinCatalogService,
  InsulinLogsService,
  PatientContextService,
  PatientInsulinService,
} from './services/index.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [HealthDiaryController],
  providers: [
    PatientContextService,
    GlucoseLogService,
    InsulinLogsService,
    InsulinCatalogService,
    PatientInsulinService,
  ],
})
export class HealthDiaryModule {}
