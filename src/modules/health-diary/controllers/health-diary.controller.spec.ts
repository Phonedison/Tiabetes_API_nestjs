import { Test, TestingModule } from '@nestjs/testing';
import { HealthDiaryService } from '../services/health-diary.service.js';
import { HealthDiaryController } from './health-diary.controller.js';

describe('HealthDiaryController', () => {
  let controller: HealthDiaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthDiaryController],
      providers: [HealthDiaryService],
    }).compile();

    controller = module.get<HealthDiaryController>(HealthDiaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
