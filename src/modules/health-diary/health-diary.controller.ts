import { Controller } from '@nestjs/common';
import { HealthDiaryService } from './health-diary.service.js';

@Controller('health-diary')
export class HealthDiaryController {
  constructor(private readonly healthDiaryService: HealthDiaryService) {}
}
