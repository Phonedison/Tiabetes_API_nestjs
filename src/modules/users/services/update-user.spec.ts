import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../../generated/client/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

describe('UsersService.update', () => {
  const prisma = { users: { findUnique: vi.fn(), update: vi.fn() } };
  const service = new UsersService(prisma as unknown as PrismaService);

  beforeEach(() => {
    vi.resetAllMocks();
    prisma.users.findUnique.mockResolvedValue({
      id: 'user',
      user_type: 'PATIENT',
    });
  });

  it.each(['PATIENT', 'DOCTOR'])(
    'accepts only a common field for %s',
    async (role) => {
      prisma.users.findUnique.mockResolvedValue({ user_type: role });
      prisma.users.update.mockResolvedValue({ email: 'new@example.com' });

      expect(
        await service.update('user', { email: 'new@example.com' }),
      ).toEqual({ email: 'new@example.com' });

      const args = prisma.users.update.mock.calls[0][0];

      expect(args.data).toEqual({
        email: 'new@example.com',
        updated_at: expect.any(Date),
      });
      expect(args.omit).toEqual({ password_hash: true });
    },
  );

  it('hashes a password before writing', async () => {
    await service.update('user', { password: 'newPassword123' });

    expect(
      await bcrypt.compare(
        'newPassword123',
        prisma.users.update.mock.calls[0][0].data.password_hash,
      ),
    ).toBe(true);
  });

  it('uses one nested write for account and patient profile', async () => {
    await service.update('user', {
      email: 'new@example.com',
      dateOfBirth: '2000-01-02',
      emergencyContactPhone: null,
    });

    expect(prisma.users.update).toHaveBeenCalledOnce();
    expect(prisma.users.update.mock.calls[0][0].data).toMatchObject({
      email: 'new@example.com',
      patient_profiles: {
        update: {
          date_of_birth: new Date('2000-01-02'),
          emergency_contact_phone: null,
          updated_at: expect.any(Date),
        },
      },
    });
  });

  it('updates doctor name alone and clears specialty explicitly', async () => {
    prisma.users.findUnique.mockResolvedValue({ user_type: 'DOCTOR' });

    await service.update('user', { fullName: 'Ana Silva' });

    expect(
      prisma.users.update.mock.calls[0][0].data.doctor_profiles.update
        .full_name,
    ).toBe('Ana Silva');

    await service.update('user', { specialty: null });
    expect(
      prisma.users.update.mock.calls[1][0].data.doctor_profiles.update
        .specialty,
    ).toBeNull();
  });

  it.each([
    {},
    { specialty: 'Invalid for patient' },
    { dateOfBirth: '2000-02-30' },
    { dateOfBirth: '2999-01-01' },
    { password: 'é'.repeat(37) },
  ])('rejects invalid changes %j', async (changes) => {
    await expect(service.update('user', changes)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('rejects patient fields for a doctor', async () => {
    prisma.users.findUnique.mockResolvedValue({ user_type: 'DOCTOR' });
    await expect(
      service.update('user', { diabetesType: 'TYPE_1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing users and administrators', async () => {
    prisma.users.findUnique.mockResolvedValue(null);

    await expect(
      service.update('user', { fullName: 'Ana Silva' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    prisma.users.findUnique.mockResolvedValue({ user_type: 'ADMIN' });

    await expect(
      service.update('user', { fullName: 'Ana Silva' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it.each([
    ['P2002', ConflictException],
    ['P2025', NotFoundException],
  ] as const)('translates %s', async (code, exception) => {
    prisma.users.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('constraint', {
        code,
        clientVersion: '7.10.1',
      }),
    );

    await expect(
      service.update('user', { fullName: 'Ana Silva' }),
    ).rejects.toBeInstanceOf(exception);
  });
});
