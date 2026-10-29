import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  const prisma = {
    users: { findUnique: vi.fn() },
    revoked_tokens: { findUnique: vi.fn() },
  };
  const config = new ConfigService({
    JWT_SECRET: 'test-secret-with-at-least-32-bytes',
  });
  const strategy = new JwtStrategy(config, prisma as unknown as PrismaService);
  const claims = () => ({
    sub: randomUUID(),
    jti: randomUUID(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each([undefined, '', 'short', ' '.repeat(40)])(
    'rejects missing or weak configuration',
    (secret) => {
      const missingConfig = new ConfigService();
      vi.spyOn(missingConfig, 'get').mockReturnValue(secret);
      expect(
        () =>
          new JwtStrategy(missingConfig, prisma as unknown as PrismaService),
      ).toThrow('JWT_SECRET');
    },
  );

  it.each([null, {}, { sub: 'invalid' }])(
    'rejects invalid claims before querying Prisma',
    async (payload) => {
      await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(prisma.revoked_tokens.findUnique).not.toHaveBeenCalled();
      expect(prisma.users.findUnique).not.toHaveBeenCalled();
    },
  );

  it('returns current identity and role from the database', async () => {
    const payload = claims();
    prisma.revoked_tokens.findUnique.mockResolvedValue(null);
    prisma.users.findUnique.mockResolvedValue({
      id: payload.sub,
      email: 'new@example.com',
      user_type: 'PATIENT',
    });

    expect(await strategy.validate({ ...payload, userType: 'ADMIN' })).toEqual({
      userId: payload.sub,
      email: 'new@example.com',
      userType: 'PATIENT',
      tokenId: payload.jti,
      expiresAt: payload.exp,
    });

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: payload.sub },
      select: { id: true, email: true, user_type: true },
    });
  });

  it('rejects revoked tokens before loading a user', async () => {
    prisma.revoked_tokens.findUnique.mockResolvedValue({ token_id: 'revoked' });
    await expect(strategy.validate(claims())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('does not authenticate when revocation storage is unavailable', async () => {
    prisma.revoked_tokens.findUnique.mockRejectedValue(
      new Error('database unavailable'),
    );

    await expect(strategy.validate(claims())).rejects.toThrow(
      'database unavailable',
    );

    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });
});
