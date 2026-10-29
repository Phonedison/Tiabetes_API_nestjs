import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '../../../generated/client/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const prisma = {
    users: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
  };
  let service: UsersService;
  const dto = {
    email: 'user@example.com',
    password: 'secret123',
    userType: 'PATIENT' as const,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(UsersService);
  });

  it('creates a user with a UUID, timestamp and hashed password', async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    prisma.users.create.mockResolvedValue({ email: dto.email });
    await service.create(dto);
    const args = prisma.users.create.mock.calls[0][0];
    expect(args.data).toMatchObject({
      email: dto.email,
      user_type: 'PATIENT',
      updated_at: expect.any(Date),
    });
    expect(args.data.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await bcrypt.compare(dto.password, args.data.password_hash)).toBe(
      true,
    );
    expect(args.omit).toEqual({ password_hash: true });
  });

  it('rejects an existing email before writing', async () => {
    prisma.users.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.users.create).not.toHaveBeenCalled();
  });

  it('handles a concurrent duplicate email', async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    prisma.users.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.1',
      }),
    );
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('loads schema relations without password hashes', async () => {
    await service.findAll();
    expect(prisma.users.findMany).toHaveBeenCalledWith({
      omit: { password_hash: true },
      include: { patient_profiles: true, doctor_profiles: true },
    });
  });
});
