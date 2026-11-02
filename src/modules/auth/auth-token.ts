import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { Environment } from '../../common/config/env.validation.js';
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

export const getJwtSecret = (
  config: ConfigService<Environment, true>,
): string => {
  return config.get('JWT_SECRET', { infer: true });
};
