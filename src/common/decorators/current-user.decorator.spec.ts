import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants.js';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import type { AuthenticatedUser } from '../../modules/auth/auth-token.js';
import { CurrentUser } from './current-user.decorator.js';

class TestController {
  handler(@CurrentUser() _user: AuthenticatedUser) {}
}
const metadata = Reflect.getMetadata(
  ROUTE_ARGS_METADATA,
  TestController,
  'handler',
) as Record<
  string,
  {
    factory: (
      data: keyof AuthenticatedUser | undefined,
      context: ExecutionContext,
    ) => unknown;
  }
>;
const factory = Object.values(metadata)[0].factory;
describe('CurrentUser', () => {
  const user: AuthenticatedUser = {
    userId: 'user-id',
    email: 'a@example.com',
    userType: 'PATIENT',
    tokenId: 'jti',
    expiresAt: 123,
  };

  it('returns the whole authenticated identity', () => {
    expect(factory(undefined, new ExecutionContextHost([{ user }]))).toBe(user);
  });

  it('returns only the selected field', () => {
    expect(factory('userId', new ExecutionContextHost([{ user }]))).toBe(
      'user-id',
    );

    expect(factory('userType', new ExecutionContextHost([{ user }]))).toBe(
      'PATIENT',
    );
  });

  it('rejects a request without an authenticated identity', () => {
    expect(() => factory('userId', new ExecutionContextHost([{}]))).toThrow(
      UnauthorizedException,
    );
  });
});
