import { Test } from '@nestjs/testing';
import { UsersService } from '../services/users.service.js';
import { UsersController } from './users.controller.js';

describe('UsersController', () => {
  it('delegates creation and listing to the service', async () => {
    const service = {
      create: vi.fn().mockResolvedValue({ id: 'user' }),
      findAll: vi.fn().mockResolvedValue([]),
    };
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();
    const controller = module.get(UsersController);
    const dto = {
      email: 'user@example.com',
      password: 'secret123',
      userType: 'PATIENT' as const,
    };
    expect(await controller.create(dto)).toEqual({ id: 'user' });
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(await controller.findAll()).toEqual([]);
  });
});
