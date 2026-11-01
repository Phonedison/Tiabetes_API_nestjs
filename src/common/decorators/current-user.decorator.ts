import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../modules/auth/auth-token.js';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const { user } = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    if (!user) throw new UnauthorizedException('Autenticação necessária.');

    return data ? user[data] : user;
  },
);
