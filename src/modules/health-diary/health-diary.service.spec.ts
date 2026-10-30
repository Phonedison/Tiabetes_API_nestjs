import { Test, TestingModule } from '@nestjs/testing';
import { HealthDiaryService } from './health-diary.service.js';

describe('HealthDiaryService', () => {
  let service: HealthDiaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthDiaryService],
    }).compile();

    service = module.get<HealthDiaryService>(HealthDiaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
