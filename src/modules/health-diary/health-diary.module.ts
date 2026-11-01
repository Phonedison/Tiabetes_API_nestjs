import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { DoctorHealthDiaryController } from './controllers/doctor-health-diary.controller.js';
import { PatientHealthDiaryController } from './controllers/patient-health-diary.controller.js';
import {
  GlucoseLogService,
  InsulinCatalogService,
  InsulinLogsService,
  PatientContextService,
  PatientInsulinService,
} from './services/index.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [
    DoctorHealthDiaryController,
    PatientHealthDiaryController,
    HealthDiaryModule,
  ],
  providers: [
    PatientContextService,
    GlucoseLogService,
    InsulinLogsService,
    InsulinCatalogService,
    PatientInsulinService,
  ],
})
export class HealthDiaryModule {}
