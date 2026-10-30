import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/client/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { createDoctorSchema } from '../dtos/doctors/create-doctor-profile.dto.js';
import { createPatientSchema } from '../dtos/index.js';
import { DoctorsService } from './doctor.service.js';
import { PatientsService } from './patients.service.js';

describe.each(['PATIENT', 'DOCTOR'] as const)('%s profiles', (role) => {
  const delegate = { create: vi.fn(), findMany: vi.fn() };
  const prisma = {
    users: { findUnique: vi.fn() },
    patient_profiles: delegate,
    doctor_profiles: delegate,
  };
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const doctorDto = createDoctorSchema.parse({
    userId,
    fullName: 'Ana Silva',
    crm: '12345',
  });
  const patientDto = createPatientSchema.parse({
    userId,
    fullName: 'Ana Silva',
    dateOfBirth: '2000-01-02',
    diabetesType: 'TYPE_1',
  });
  const doctors = new DoctorsService(prisma as unknown as PrismaService);
  const patients = new PatientsService(prisma as unknown as PrismaService);
  const create = () =>
    role === 'DOCTOR'
      ? doctors.createDoctorProfile(doctorDto)
      : patients.createPatientProfile(patientDto);

  beforeEach(() => {
    vi.resetAllMocks();
    prisma.users.findUnique.mockResolvedValue({ id: userId, user_type: role });
  });

  it('creates a profile for the existing user using schema fields', async () => {
    await create();
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
    const data = delegate.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      user_id: userId,
      full_name: 'Ana Silva',
      updated_at: expect.any(Date),
    });
    expect(data.id).toMatch(/^[0-9a-f-]{36}$/);
    if (role === 'PATIENT') {
      expect(data.date_of_birth).toEqual(new Date('2000-01-02'));
      expect(data.diabetes_type).toBe('TYPE_1');
    } else {
      expect(data.crm).toBe('12345');
    }
  });

  it('rejects an unknown user', async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    await expect(create()).rejects.toBeInstanceOf(NotFoundException);
    expect(delegate.create).not.toHaveBeenCalled();
  });

  it('rejects an incompatible user type', async () => {
    prisma.users.findUnique.mockResolvedValue({ user_type: 'ADMIN' });
    await expect(create()).rejects.toBeInstanceOf(BadRequestException);
    expect(delegate.create).not.toHaveBeenCalled();
  });

  it.each([
    ['P2002', ConflictException],
    ['P2003', NotFoundException],
  ] as const)('translates constraint error %s', async (code, exception) => {
    delegate.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('constraint', {
        code,
        clientVersion: '7.10.1',
      }),
    );
    await expect(create()).rejects.toBeInstanceOf(exception);
  });

  it('preserves unexpected database errors', async () => {
    const error = new Error('Database unavailable');
    delegate.create.mockRejectedValue(error);
    await expect(create()).rejects.toBe(error);
  });

  it('omits user passwords when listing profiles', async () => {
    await (role === 'DOCTOR' ? doctors.findAll() : patients.findAll());
    expect(delegate.findMany).toHaveBeenCalledWith({
      include: { users: { omit: { password_hash: true } } },
    });
  });
});

describe('Profile DTO validation', () => {
  it('rejects invalid UUIDs and impossible birth dates', () => {
    expect(
      createDoctorSchema.safeParse({
        userId: 'invalid',
        fullName: 'Ana',
        crm: '12345',
      }).success,
    ).toBe(false);
    expect(
      createPatientSchema.safeParse({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        fullName: 'Ana',
        dateOfBirth: '2000-02-30',
        diabetesType: 'TYPE_1',
      }).success,
    ).toBe(false);
  });
});
