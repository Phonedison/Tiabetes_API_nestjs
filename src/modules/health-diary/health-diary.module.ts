import { Module } from '@nestjs/common';
import { HealthDiaryController } from './controllers/health-diary.controller.js';
import {
  GlucoseLogService,
  InsulinLogService,
  PatientInsulinService,
} from './services/index.js';

@Module({
  controllers: [HealthDiaryController],
  providers: [GlucoseLogService, InsulinLogService, PatientInsulinService],
})
export class HealthDiaryModule {}
