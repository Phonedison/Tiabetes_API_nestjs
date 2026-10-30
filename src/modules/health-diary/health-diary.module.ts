import { Module } from '@nestjs/common';
import { HealthDiaryController } from './controllers/health-diary.controller.js';
import { HealthDiaryService } from './services/health-diary.service.js';

@Module({
  controllers: [HealthDiaryController],
  providers: [HealthDiaryService],
})
export class HealthDiaryModule {}
