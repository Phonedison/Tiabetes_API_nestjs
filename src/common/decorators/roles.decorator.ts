import { SetMetadata } from '@nestjs/common';
import type { AuthenticatedUser } from '../../modules/auth/auth-token.js';

export const ROLES_KEY = 'role';
export const Roles = (...roles: AuthenticatedUser['userType'][]) =>
  SetMetadata(ROLES_KEY, roles);
