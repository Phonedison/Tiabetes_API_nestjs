import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { jwtExpiresInSchema, jwtSecretSchema } from '../../common/index.js';
import type { user_type_enum } from '../../generated/client/enums.js';

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
  const result = jwtSecretSchema.safeParse(config.get('jwt.secret'));

  if (!result.success)
    throw new Error('JWT_SECRET deve conter pelo menos 32 bytes.');

  return result.data;
};

export const getJwtExpiresIn = (config: ConfigService): number =>
  jwtExpiresInSchema.parse(config.get('jwt.expiresIn'));
