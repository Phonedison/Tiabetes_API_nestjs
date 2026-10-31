import { Test } from '@nestjs/testing';
import type { FastifyRequest } from 'fastify';
import {
  GlucoseLogService,
  InsulinCatalogService,
  InsulinLogsService,
  PatientInsulinService,
} from '../services/index.js';
import { PatientContextService } from '../services/patient/patient-context.service.js';
import { HealthDiaryController } from './health-diary.controller.js';

describe('HealthDiaryController', () => {
  it('passes the resolved patient profile ID to the glucose service', async () => {
    const context = { resolve: vi.fn().mockResolvedValue('profile-id') };
    const glucose = { create: vi.fn().mockResolvedValue({ id: 'log-id' }) };
    const module = await Test.createTestingModule({
      controllers: [HealthDiaryController],
      providers: [
        { provide: PatientContextService, useValue: context },
        { provide: GlucoseLogService, useValue: glucose },
        { provide: InsulinCatalogService, useValue: {} },
        { provide: InsulinLogsService, useValue: {} },
        { provide: PatientInsulinService, useValue: {} },
      ],
    }).compile();
    const controller = module.get(HealthDiaryController);
    const user = {
      userId: 'user-id',
      userType: 'PATIENT' as const,
      email: 'p@example.com',
      tokenId: 'token',
      expiresAt: 1,
    };
    const dto = {
      glucoseValue: 100,
      context: 'FASTING' as const,
      measuredAt: new Date(),
    };

    expect(
      await controller.createGlucoseLogs(dto, { user } as FastifyRequest & {
        user: typeof user;
      }),
    ).toEqual({ id: 'log-id' });
    expect(context.resolve).toHaveBeenCalledWith(user);
    expect(glucose.create).toHaveBeenCalledWith('profile-id', dto);
  });
});
