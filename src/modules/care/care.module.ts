import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CareController } from './controllers/care/care.controller.js';
import {
  ClinicalAccessService,
  ClinicalRelationService,
  RequestDoctorLinkService,
  RequestPatientLinkService,
} from './services/index.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CareController],
  providers: [
    ClinicalAccessService,
    ClinicalRelationService,
    RequestDoctorLinkService,
    RequestPatientLinkService,
  ],
})
export class CareModule {}
