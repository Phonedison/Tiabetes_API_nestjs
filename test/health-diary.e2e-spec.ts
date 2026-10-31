import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { Prisma } from '../src/generated/client/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Health diary (Fastify)', () => {
  let app: NestFastifyApplication;
  const secret = 'health-diary-test-secret-at-least-32-bytes';
  const userId = randomUUID(),
    patientId = randomUUID(),
    insulinId = randomUUID(),
    linkId = randomUUID();
  const date = new Date('2026-01-02T12:00:00Z');
  const insulin = {
    id: insulinId,
    name: 'Insulina exemplo',
    category: 'RAPID',
    brand: null,
  };
  const link = {
    id: linkId,
    patient_id: patientId,
    insulin_id: insulinId,
    default_dosage: new Prisma.Decimal(0),
    notes: null,
    is_active: true,
    created_at: date,
  };
  const prisma = {
    users: { findUnique: vi.fn() },
    revoked_tokens: { findUnique: vi.fn() },
    patient_profiles: { findUnique: vi.fn() },
    insulins: { findUnique: vi.fn(), findMany: vi.fn() },
    patient_insulins: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    glucose_logs: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    insulin_logs: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn(),
  };
  const headers = () => ({
    authorization:
      'Bearer ' +
      new JwtService({ secret }).sign(
        { sub: userId, jti: randomUUID() },
        { expiresIn: 3600 },
      ),
  });

  beforeEach(async () => {
    vi.resetAllMocks();

    prisma.users.findUnique.mockResolvedValue({
      id: userId,
      email: 'p@example.com',
      user_type: 'PATIENT',
    });
    prisma.revoked_tokens.findUnique.mockResolvedValue(null);
    prisma.patient_profiles.findUnique.mockResolvedValue({ id: patientId });
    prisma.insulins.findUnique.mockResolvedValue(insulin);
    prisma.insulins.findMany.mockResolvedValue([insulin]);
    prisma.patient_insulins.findFirst.mockResolvedValue(link);
    prisma.patient_insulins.create.mockImplementation(async ({ data }) => ({
      ...data,
      is_active: true,
      created_at: date,
    }));
    prisma.patient_insulins.findMany.mockResolvedValue([
      { ...link, insulins: insulin },
    ]);
    prisma.glucose_logs.create.mockImplementation(async ({ data }) => ({
      ...data,
      created_at: date,
    }));
    prisma.insulin_logs.create.mockImplementation(async ({ data }) => ({
      ...data,
      units_applied: new Prisma.Decimal(data.units_applied),
      created_at: date,
    }));
    prisma.glucose_logs.findMany.mockResolvedValue([]);
    prisma.glucose_logs.count.mockResolvedValue(0);
    prisma.insulin_logs.findMany.mockResolvedValue([]);
    prisma.insulin_logs.count.mockResolvedValue(0);
    prisma.$transaction.mockImplementation(async (queries) =>
      Promise.all(queries),
    );

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

  it.each([
    ['GET', 'glucose-logs'],
    ['POST', 'glucose-logs'],
    ['GET', 'insulins'],
    ['GET', 'insulin-logs'],
    ['POST', 'insulin-logs'],
    ['GET', 'patient-insulins'],
    ['POST', 'patient-insulins'],
  ] as const)('protects %s %s', async (method, route) => {
    expect(
      (await app.inject({ method, url: '/health-diary/' + route })).statusCode,
    ).toBe(401);
  });

  it('resolves the patient profile and generates a glucose ID', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/health-diary/glucose-logs',
      headers: headers(),
      payload: { glucoseValue: 100, measuredAt: '2026-01-02T09:00:00-03:00' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      id: expect.any(String),
      patientId,
      glucoseValue: 100,
      context: 'FASTING',
      measuredAt: date.toISOString(),
    });
    expect(prisma.patient_profiles.findUnique).toHaveBeenCalledWith({
      where: { user_id: userId },
      select: { id: true },
    });
    expect(
      prisma.glucose_logs.create.mock.calls[0][0].data.patient_id,
    ).not.toBe(userId);
  });

  it.each([
    { glucoseValue: -1, measuredAt: date.toISOString() },
    { glucoseValue: 2.5, measuredAt: date.toISOString() },
    { glucoseValue: 100, measuredAt: 'not-a-date' },
    { glucoseValue: 100, measuredAt: date.toISOString(), patientId },
    { glucoseValue: 100, measuredAt: date.toISOString(), id: randomUUID() },
  ])('rejects invalid glucose body %j', async (payload) => {
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/health-diary/glucose-logs',
          headers: headers(),
          payload,
        })
      ).statusCode,
    ).toBe(400);
    expect(prisma.glucose_logs.create).not.toHaveBeenCalled();
  });

  it.each(['DOCTOR', 'ADMIN'])(
    'forbids patient data for %s but permits the catalog',
    async (role) => {
      prisma.users.findUnique.mockResolvedValue({
        id: userId,
        email: 'a@example.com',
        user_type: role,
      });
      expect(
        (
          await app.inject({
            method: 'GET',
            url: '/health-diary/glucose-logs',
            headers: headers(),
          })
        ).statusCode,
      ).toBe(403);
      expect(
        (
          await app.inject({
            method: 'GET',
            url: '/health-diary/insulins',
            headers: headers(),
          })
        ).statusCode,
      ).toBe(200);
    },
  );

  it('returns 404 if the patient profile does not exist', async () => {
    prisma.patient_profiles.findUnique.mockResolvedValue(null);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/health-diary/glucose-logs',
          headers: headers(),
        })
      ).statusCode,
    ).toBe(404);
    expect(prisma.glucose_logs.findMany).not.toHaveBeenCalled();
  });

  it.each([
    'page=0',
    'page=1.5',
    'page=abc',
    'limit=101',
    'limit=-1',
    'page=21474837',
    'page=1&page=2',
  ])('validates pagination %s', async (query) => {
    for (const route of ['glucose-logs', 'insulin-logs']) {
      expect(
        (
          await app.inject({
            method: 'GET',
            url: '/health-diary/' + route + '?' + query,
            headers: headers(),
          })
        ).statusCode,
      ).toBe(400);
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('paginates records and scopes both query and count to the profile', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health-diary/glucose-logs?page=2&limit=5',
      headers: headers(),
    });
    expect(response.json()).toEqual({
      data: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemPerPage: 5,
        totalPages: 0,
        currentPage: 2,
      },
    });
    expect(prisma.glucose_logs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { patient_id: patientId },
        skip: 5,
        take: 5,
      }),
    );
    expect(prisma.glucose_logs.count).toHaveBeenCalledWith({
      where: { patient_id: patientId },
    });
  });

  it('returns the catalog and patient-insulin IDs including zero dosage', async () => {
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/health-diary/insulins',
          headers: headers(),
        })
      ).json(),
    ).toEqual([insulin]);
    const response = await app.inject({
      method: 'GET',
      url: '/health-diary/patient-insulins',
      headers: headers(),
    });
    expect(response.json()[0]).toMatchObject({
      id: linkId,
      patientId,
      defaultDosage: 0,
      insulin,
    });
    expect(prisma.patient_insulins.findMany.mock.calls[0][0].where).toEqual({
      patient_id: patientId,
    });
  });

  it('creates a patient-insulin link with server-owned identifiers', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/health-diary/patient-insulins',
      headers: headers(),
      payload: { insulinId, defaultDosage: 0 },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      id: expect.any(String),
      patientId,
      insulinId,
      defaultDosage: 0,
      isActive: true,
    });
  });

  it('returns 404 for an unknown catalog insulin', async () => {
    prisma.insulins.findUnique.mockResolvedValue(null);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/health-diary/patient-insulins',
          headers: headers(),
          payload: { insulinId },
        })
      ).statusCode,
    ).toBe(404);
    expect(prisma.patient_insulins.create).not.toHaveBeenCalled();
  });

  it('returns 409 for a duplicate link, including concurrent inserts', async () => {
    prisma.patient_insulins.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.1',
      }),
    );
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/health-diary/patient-insulins',
          headers: headers(),
          payload: { insulinId },
        })
      ).statusCode,
    ).toBe(409);
  });

  it('creates and lists insulin logs with IDs and numeric decimals', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/health-diary/insulin-logs',
      headers: headers(),
      payload: {
        patientInsulinId: linkId,
        unitApplied: 1.25,
        appliedAt: date.toISOString(),
      },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      id: expect.any(String),
      patientId,
      patientInsulinId: linkId,
      unitsApplied: 1.25,
    });
    expect(prisma.patient_insulins.findFirst).toHaveBeenCalledWith({
      where: { id: linkId, patient_id: patientId },
    });
    prisma.insulin_logs.findMany.mockResolvedValue([
      {
        id: randomUUID(),
        patient_id: patientId,
        patient_insulin_id: linkId,
        units_applied: new Prisma.Decimal(1.25),
        applied_at: date,
        notes: null,
        created_at: date,
        patient_insulins: { ...link, insulins: insulin },
      },
    ]);
    prisma.insulin_logs.count.mockResolvedValue(1);
    const list = await app.inject({
      method: 'GET',
      url: '/health-diary/insulin-logs',
      headers: headers(),
    });
    expect(list.json().data[0]).toMatchObject({
      id: expect.any(String),
      unitsApplied: 1.25,
      insulin,
    });
    expect(list.json().meta.totalItems).toBe(1);
  });

  it.each([0, -1, 10000, 1.234, '2'])(
    'rejects invalid applied dosage %j',
    async (unitApplied) => {
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/health-diary/insulin-logs',
            headers: headers(),
            payload: {
              patientInsulinId: linkId,
              unitApplied,
              appliedAt: date.toISOString(),
            },
          })
        ).statusCode,
      ).toBe(400);
      expect(prisma.insulin_logs.create).not.toHaveBeenCalled();
    },
  );

  it('rejects a foreign or missing patient-insulin link', async () => {
    prisma.patient_insulins.findFirst.mockResolvedValue(null);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/health-diary/insulin-logs',
          headers: headers(),
          payload: {
            patientInsulinId: linkId,
            unitApplied: 1,
            appliedAt: date.toISOString(),
          },
        })
      ).statusCode,
    ).toBe(404);
    expect(prisma.insulin_logs.create).not.toHaveBeenCalled();
  });

  it('rejects an inactive patient-insulin link', async () => {
    prisma.patient_insulins.findFirst.mockResolvedValue({
      ...link,
      is_active: false,
    });
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/health-diary/insulin-logs',
          headers: headers(),
          payload: {
            patientInsulinId: linkId,
            unitApplied: 1,
            appliedAt: date.toISOString(),
          },
        })
      ).statusCode,
    ).toBe(400);
    expect(prisma.insulin_logs.create).not.toHaveBeenCalled();
  });
});
