import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RoleMatchingMode } from 'nest-keycloak-connect';
import { SiteRoleGuard } from './site-role.guard';

describe('SiteRoleGuard', () => {
  const createContext = (request: any = {}): ExecutionContext =>
    ({
      getType: jest.fn(() => 'http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => request),
      })),
    }) as any;

  const createGuard = (rolesOptions: any, decodedToken: any = undefined) => {
    const reflector = {
      getAllAndOverride: jest.fn(() => rolesOptions),
    } as unknown as Reflector;
    const jwtService = {
      decode: jest.fn(() => decodedToken),
    } as unknown as JwtService;

    return {
      guard: new SiteRoleGuard(reflector, jwtService),
      jwtService,
    };
  };

  it('allows requests without site role metadata', () => {
    const { guard } = createGuard(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('normalizes loginSource when no site role metadata exists', () => {
    const request: any = {
      user: { loginSource: 'IDIR', site_roles: ['site-internal-user'] },
    };
    const { guard } = createGuard(undefined);

    expect(guard.canActivate(createContext(request))).toBe(true);
    expect(request.user.identity_provider).toBe('idir');
  });

  it('allows requests when any required role is present in site_roles', () => {
    const { guard } = createGuard({
      roles: ['site-external-user'],
      mode: RoleMatchingMode.ANY,
    });

    expect(
      guard.canActivate(
        createContext({ user: { site_roles: ['site-external-user'] } }),
      ),
    ).toBe(true);
  });

  it('denies requests when required roles are absent', () => {
    const { guard } = createGuard({
      roles: ['site-registrar'],
      mode: RoleMatchingMode.ANY,
    });

    expect(
      guard.canActivate(
        createContext({ user: { site_roles: ['site-external-user'] } }),
      ),
    ).toBe(false);
  });

  it('requires every role in all matching mode', () => {
    const { guard } = createGuard({
      roles: ['site-internal-user', 'site-registrar'],
      mode: RoleMatchingMode.ALL,
    });

    expect(
      guard.canActivate(
        createContext({
          user: { site_roles: ['site-internal-user', 'site-registrar'] },
        }),
      ),
    ).toBe(true);
  });

  it('decodes bearer tokens when request user data is unavailable', () => {
    const { guard, jwtService } = createGuard(
      { roles: ['site-external-user'], mode: RoleMatchingMode.ANY },
      { site_roles: ['site-external-user'] },
    );

    expect(
      guard.canActivate(
        createContext({ headers: { authorization: 'Bearer test-token' } }),
      ),
    ).toBe(true);
    expect(jwtService.decode).toHaveBeenCalledWith('test-token');
  });

  it('normalizes loginSource to identity_provider for downstream services', () => {
    const request: any = {
      user: { loginSource: 'IDIR', site_roles: ['site-internal-user'] },
    };
    const { guard } = createGuard({
      roles: ['site-internal-user'],
      mode: RoleMatchingMode.ANY,
    });

    expect(guard.canActivate(createContext(request))).toBe(true);
    expect(request.user.identity_provider).toBe('idir');
  });
});