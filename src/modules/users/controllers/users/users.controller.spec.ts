import { Test } from '@nestjs/testing';
import { DoctorsService } from '../../services/doctors/doctor.service.js';
import { PatientsService, UsersService } from '../../services/index.js';
import { UsersController } from './users.controller.js';

describe('UsersController', () => {
  it('delegates registration to the service', async () => {
    const service = { create: vi.fn().mockResolvedValue({ id: 'user' }) };
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
        { provide: PatientsService, useValue: {} },
        { provide: DoctorsService, useValue: {} },
      ],
    }).compile();
    const controller = module.get(UsersController);
    const dto = {
      email: 'user@example.com',
      password: 'secret123',
      userType: 'PATIENT' as const,
    };

    expect(await controller.create(dto)).toEqual({ id: 'user' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
