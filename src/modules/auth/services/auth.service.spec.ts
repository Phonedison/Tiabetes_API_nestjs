import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const prisma = {
    users: { findUnique: vi.fn() },
    revoked_tokens: { upsert: vi.fn() },
  };
  const jwt = new JwtService({
    secret: 'test-only-secret-with-at-least-32-bytes',
  });
  const service = new AuthService(jwt, prisma as unknown as PrismaService);
  const id = '550e8400-e29b-41d4-a716-446655440000';
  let hash: string;

  beforeAll(async () => {
    hash = await bcrypt.hash('secret123', 4);
  });
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('issues distinct signed tokens with a one-hour lifetime and no password', async () => {
    prisma.users.findUnique.mockResolvedValue({ id, password_hash: hash });
    const first = await service.login('user@example.com', 'secret123');
    const second = await service.login('user@example.com', 'secret123');
    expect(first).toMatchObject({ token_type: 'Bearer', expires_in: 3600 });
    const payload = jwt.verify(first.access_token);
    expect(payload.sub).toBe(id);
    expect(payload.exp - payload.iat).toBe(3600);
    expect(payload.jti).not.toBe(jwt.verify(second.access_token).jti);
    expect(payload).not.toHaveProperty('password_hash');
    expect(first).not.toHaveProperty('acess_token');
  });

  it.each([null, { password_hash: 'placeholder' }])(
    'rejects unknown users or wrong passwords',
    async (user) => {
      prisma.users.findUnique.mockResolvedValue(
        user ? { id, password_hash: hash } : null,
      );
      await expect(
        service.login('user@example.com', 'wrong'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    },
  );

  it('rejects a password beyond the bcrypt byte limit', async () => {
    await expect(
      service.login('user@example.com', 'a'.repeat(73)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('revokes the current token with the original expiry, idempotently', async () => {
    const user = {
      userId: id,
      email: 'user@example.com',
      userType: 'PATIENT' as const,
      tokenId: id,
      expiresAt: 1800000000,
    };
    await service.logout(user);
    await service.logout(user);
    expect(prisma.revoked_tokens.upsert).toHaveBeenLastCalledWith({
      where: { token_id: id },
      create: { token_id: id, expires_at: new Date(1800000000000) },
      update: {},
    });
  });

  it('does not report success when persisting revocation fails', async () => {
    prisma.revoked_tokens.upsert.mockRejectedValue(
      new Error('database unavailable'),
    );
    await expect(
      service.logout({
        userId: id,
        email: 'a@b.com',
        userType: 'PATIENT',
        tokenId: id,
        expiresAt: 1800000000,
      }),
    ).rejects.toThrow('database unavailable');
  });
});
