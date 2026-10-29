import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import type { user_type_enum } from '../../generated/client/enums.js';

export const ACCESS_TOKEN_TTL_SECONDS = 3600;
export const accessTokenSchema = z
  .object({
    sub: z.uuid(),
    jti: z.uuid(),
    iat: z.number().int().nonnegative(),
    exp: z.number().int().positive().max(8640000000000),
  })
  .refine((value) => value.exp > value.iat);

export interface AuthenticatedUser {
  userId: string;
  email: string;
  userType: user_type_enum;
  tokenId: string;
  expiresAt: number;
}

export const getJwtSecret = (config: ConfigService): string => {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret || Buffer.byteLength(secret.trim(), 'utf8') < 32) {
    throw new Error(
      'JWT_SECRET deve conter pelo menos 32 bytes e ser gerado aleatoriamente.',
    );
  }
  return secret;
};
