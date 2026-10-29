import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  it('delegates login with the validated password', async () => {
    const service = {
      login: vi.fn().mockResolvedValue({ access_token: 'token' }),
    };
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();
    const controller = module.get(AuthController);

    expect(
      await controller.login({
        email: 'user@example.com',
        password: 'secret123',
      }),
    ).toEqual({ access_token: 'token' });
    expect(service.login).toHaveBeenCalledWith('user@example.com', 'secret123');
  });
});
