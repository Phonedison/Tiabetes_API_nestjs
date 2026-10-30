import { Module } from '@nestjs/common';
import { HealthDiaryController } from './controllers/health-diary.controller.js';
import {
  GlucoseLogService,
  InsulinCatalogService,
  InsulinLogsService,
  PatientInsulinService,
} from './services/index.js';

@Module({
  controllers: [HealthDiaryController],
  providers: [
    GlucoseLogService,
    InsulinLogsService,
    InsulinCatalogService,
    PatientInsulinService,
  ],
})
export class HealthDiaryModule {}
