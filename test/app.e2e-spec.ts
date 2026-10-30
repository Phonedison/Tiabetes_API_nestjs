import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('App authentication (Fastify)', () => {
  let app: NestFastifyApplication;
  const secret = 'test-only-secret-with-at-least-32-bytes';
  const jwt = new JwtService({ secret });
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const email = 'user@example.com';
  let passwordHash: string;
  let userType: 'PATIENT' | 'ADMIN';
  const revoked = new Map<string, { token_id: string; expires_at: Date }>();
  const prisma = {
    users: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    patient_profiles: { findUnique: vi.fn(), create: vi.fn() },
    doctor_profiles: { create: vi.fn() },
    revoked_tokens: { findUnique: vi.fn(), upsert: vi.fn() },
  };

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('secret123', 4);
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    revoked.clear();
    userType = 'PATIENT';
    prisma.users.findUnique.mockImplementation(async ({ where }) =>
      where.id === userId || where.email === email
        ? {
            id: userId,
            email,
            user_type: userType,
            password_hash: passwordHash,
          }
        : null,
    );

    prisma.revoked_tokens.findUnique.mockImplementation(
      async ({ where }) => revoked.get(where.token_id) ?? null,
    );

    prisma.revoked_tokens.upsert.mockImplementation(async ({ create }) => {
      revoked.set(create.token_id, create);
      return create;
    });

    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ JWT_SECRET: secret }))
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

  const login = async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email, password: 'secret123' },
    });

    expect(response.statusCode).toBe(200);
    return response.json().access_token as string;
  };

  const headers = (token: string) => {
    return { authorization: 'Bearer ' + token };
  };

  it('keeps the health route public', async () => {
    expect((await app.inject({ method: 'GET', url: '/' })).statusCode).toBe(
      200,
    );
  });

  it('PATCH /users/me uses the authenticated ID and returns the update', async () => {
    const token = await login();
    prisma.users.update.mockResolvedValue({
      id: userId,
      email: 'new@example.com',
    });
    const response = await app.inject({
      method: 'PATCH',
      url: '/users/me',
      headers: headers(token),
      payload: { email: 'new@example.com' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: userId, email: 'new@example.com' });
    expect(prisma.users.update.mock.calls[0][0].where).toEqual({ id: userId });
  });

  it.each([
    {},
    { userId: 'another-user', fullName: 'Ana Silva' },
    { userType: 'ADMIN' },
    { especialty: 'Cardiology' },
    { specialty: 'Cardiology' },
  ])('PATCH rejects invalid or incompatible input %j', async (payload) => {
    const token = await login();
    const response = await app.inject({
      method: 'PATCH',
      url: '/users/me',
      headers: headers(token),
      payload,
    });
    expect(response.statusCode).toBe(400);
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('PATCH requires authentication and rejects administrators', async () => {
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: '/users/me',
          payload: { fullName: 'Ana Silva' },
        })
      ).statusCode,
    ).toBe(401);
    userType = 'ADMIN';
    const token = await login();
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: '/users/me',
          headers: headers(token),
          payload: { fullName: 'Ana Silva' },
        })
      ).statusCode,
    ).toBe(403);
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('supports login, token validation, logout and rejection after logout', async () => {
    const token = await login();
    const otherToken = await login();
    const me = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: headers(token),
    });

    expect(me.statusCode).toBe(200);
    expect(me.json()).toEqual({ userId, email, userType: 'PATIENT' });

    const logout = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: headers(token),
      payload: { tokenId: 'ignored' },
    });

    expect(logout.statusCode).toBe(200);
    expect(revoked.has(jwt.verify(token).jti)).toBe(true);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/auth/me',
          headers: headers(token),
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/auth/logout',
          headers: headers(token),
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/auth/me',
          headers: headers(otherToken),
        })
      ).statusCode,
    ).toBe(200);
  });

  it('accepts the original pass field', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email, pass: 'secret123' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      access_token: expect.any(String),
      expires_in: 3600,
      token_type: 'Bearer',
    });
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it.each([
    {},
    { email: 'invalid', password: 'x' },
    { email, password: 123 },
    { email, password: '' },
    { email, password: 'a'.repeat(73) },
    { email, password: 'é'.repeat(37) },
    { email, pass: 'secret123', password: 'different' },
  ])(
    'rejects invalid login input before accessing Prisma: %j',
    async (payload) => {
      expect(
        (await app.inject({ method: 'POST', url: '/auth/login', payload }))
          .statusCode,
      ).toBe(400);
      expect(prisma.users.findUnique).not.toHaveBeenCalled();
    },
  );

  it.each([
    { email, password: 'wrong' },
    { email: 'missing@example.com', password: 'secret123' },
  ])('returns 401 for invalid credentials', async (payload) => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload,
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().message).toBe('Usuário ou senha incorreto!');
  });

  it.each([
    '/auth/me',
    '/users',
    '/users/email/user@example.com',
    '/users/patient/' + userId,
  ])('protects %s', async (url) => {
    expect((await app.inject({ method: 'GET', url })).statusCode).toBe(401);
  });

  it('protects logout and profile creation', async () => {
    for (const url of ['/auth/logout', '/users/patient', '/users/doctor']) {
      expect(
        (await app.inject({ method: 'POST', url, payload: {} })).statusCode,
      ).toBe(401);
    }
    expect(prisma.revoked_tokens.upsert).not.toHaveBeenCalled();
  });

  it('rejects malformed, expired, incorrectly signed and incomplete tokens', async () => {
    const claims = { sub: userId, jti: randomUUID() };
    const tokens = [
      'invalid',
      jwt.sign(claims, { expiresIn: -1 }),
      jwt.sign(claims, { secret: 'wrong-secret', expiresIn: 3600 }),
      jwt.sign(claims, { algorithm: 'HS384', expiresIn: 3600 }),
      jwt.sign(claims),
      jwt.sign({ sub: userId }, { expiresIn: 3600 }),
      jwt.sign({ sub: 'bad-uuid', jti: randomUUID() }, { expiresIn: 3600 }),
      jwt.sign(
        { ...claims, iat: Math.floor(Date.now() / 1000) + 120 },
        { expiresIn: 3600 },
      ),
    ];
    for (const token of tokens) {
      expect(
        (
          await app.inject({
            method: 'GET',
            url: '/auth/me',
            headers: headers(token),
          })
        ).statusCode,
      ).toBe(401);
    }
    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('rejects tokens for a deleted user', async () => {
    const token = await login();
    prisma.users.findUnique.mockResolvedValue(null);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/auth/me',
          headers: headers(token),
        })
      ).statusCode,
    ).toBe(401);
  });

  it('does not allow a patient to list all users, but allows an administrator', async () => {
    const token = await login();
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/users',
          headers: headers(token),
        })
      ).statusCode,
    ).toBe(403);
    expect(prisma.users.findMany).not.toHaveBeenCalled();
    userType = 'ADMIN';
    prisma.users.findMany.mockResolvedValue([]);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/users',
          headers: headers(token),
        })
      ).statusCode,
    ).toBe(200);
  });

  it('blocks access to another user profile and validates UUIDs', async () => {
    const token = await login();
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/users/patient/' + randomUUID(),
          headers: headers(token),
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/users/patient/invalid',
          headers: headers(token),
        })
      ).statusCode,
    ).toBe(400);
    expect(prisma.patient_profiles.findUnique).not.toHaveBeenCalled();
    prisma.patient_profiles.findUnique.mockResolvedValue(null);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/users/patient/' + userId,
          headers: headers(token),
        })
      ).statusCode,
    ).toBe(404);
  });

  it('blocks profile creation for another user', async () => {
    const token = await login();
    const response = await app.inject({
      method: 'POST',
      url: '/users/patient',
      headers: headers(token),
      payload: {
        userId: randomUUID(),
        fullName: 'Ana Silva',
        dateOfBirth: '2000-01-02',
        diabetesType: 'TYPE_1',
      },
    });
    expect(response.statusCode).toBe(403);
    expect(prisma.patient_profiles.create).not.toHaveBeenCalled();
  });

  it('rejects public ADMIN registration', async () => {
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/users',
          payload: { email, password: 'secret123', userType: 'ADMIN' },
        })
      ).statusCode,
    ).toBe(400);
    expect(prisma.users.create).not.toHaveBeenCalled();
  });

  it('keeps patient registration public', async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    prisma.users.create.mockResolvedValue({
      id: userId,
      email,
      user_type: 'PATIENT',
    });
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email, password: 'secret123' },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).not.toHaveProperty('password_hash');
  });
});
