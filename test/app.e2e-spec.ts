import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('App (Fastify)', () => {
  let app: NestFastifyApplication;
  const prisma = {
    users: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('GET /', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Hello World!');
  });

  it('rejects invalid users before querying the database', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email: 'invalid', password: 'x' },
    });
    expect(response.statusCode).toBe(400);
    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('creates a user with the default PATIENT type', async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    prisma.users.create.mockResolvedValue({
      id: 'user',
      email: 'user@example.com',
      user_type: 'PATIENT',
    });
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email: 'user@example.com', password: 'secret123' },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).not.toHaveProperty('password_hash');
    expect(prisma.users.create.mock.calls[0][0].data.user_type).toBe('PATIENT');
  });

  it('GET /users', async () => {
    prisma.users.findMany.mockResolvedValue([]);
    const response = await app.inject({ method: 'GET', url: '/users' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });
});
