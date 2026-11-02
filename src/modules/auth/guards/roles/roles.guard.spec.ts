import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { Roles } from '../../../../common/decorators/roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

@Roles('PATIENT')
class RestrictedController {
  inherited(this: void) {}
  @Roles('DOCTOR', 'ADMIN')
  override(this: void) {}
}
class OpenController {
  handler(this: void) {}
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());
  it('allows routes without role metadata', () => {
    expect(
      guard.canActivate(
        new ExecutionContextHost(
          [{}],
          OpenController,
          OpenController.prototype.handler,
        ),
      ),
    ).toBe(true);
  });

  it.each(['PATIENT', 'DOCTOR', 'ADMIN'] as const)(
    'checks controller roles for %s',
    (userType) => {
      const ctx = new ExecutionContextHost(
        [{ user: { userType } }],
        RestrictedController,
        RestrictedController.prototype.inherited,
      );

      if (userType === 'PATIENT') expect(guard.canActivate(ctx)).toBe(true);
      else expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    },
  );

  it.each(['DOCTOR', 'ADMIN'])('allows method override for %s', (userType) => {
    expect(
      guard.canActivate(
        new ExecutionContextHost(
          [{ user: { userType } }],
          RestrictedController,
          RestrictedController.prototype.override,
        ),
      ),
    ).toBe(true);
  });

  it('does not merge class permissions into a method override', () => {
    expect(() =>
      guard.canActivate(
        new ExecutionContextHost(
          [{ user: { userType: 'PATIENT' } }],
          RestrictedController,
          RestrictedController.prototype.override,
        ),
      ),
    ).toThrow(ForbiddenException);
  });

  it.each([{}, { user: null }, { user: { userType: 'UNKNOWN' } }])(
    'rejects missing or invalid identity safely',
    (request) => {
      expect(() =>
        guard.canActivate(
          new ExecutionContextHost(
            [request],
            RestrictedController,
            RestrictedController.prototype.inherited,
          ),
        ),
      ).toThrow(ForbiddenException);
    },
  );
});
