import { Module } from '@nestjs/common';
import { HealthDiaryService } from './health-diary.service.js';
import { HealthDiaryController } from './health-diary.controller.js';

@Module({
  controllers: [HealthDiaryController],
  providers: [HealthDiaryService],
})
export class HealthDiaryModule {}
