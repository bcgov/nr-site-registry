import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RoleMatchingMode } from 'nest-keycloak-connect';
import { SITE_ROLES_KEY, SiteRolesOptions } from './site-roles.decorator';

// This replaces the nest-keycloak-connect @Roles guard with a custom
// implementation for site roles. Must run after the package AuthGuard, which
// verifies the token and populates request.user.
@Injectable()
export class SiteRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest(context);
    const tokenData = this.getTokenData(request);
    const options = this.reflector.getAllAndOverride<SiteRolesOptions>(
      SITE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options?.roles?.length) {
      return true;
    }

    const userRoles = this.getSiteRoles(tokenData);
    const mode = options.mode ?? RoleMatchingMode.ANY;

    if (mode === RoleMatchingMode.ALL) {
      return options.roles.every((role) => userRoles.includes(role));
    }

    return options.roles.some((role) => userRoles.includes(role));
  }

  private getRequest(context: ExecutionContext): any {
    if (context.getType<'graphql' | 'http'>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context).getContext();
      return gqlContext?.req;
    }

    return context.switchToHttp().getRequest();
  }

  private getTokenData(request: any): any {
    if (!request?.user) {
      return undefined;
    }

    this.normalizeUserClaims(request.user);
    return request.user;
  }

  private normalizeUserClaims(user: any): void {
    if (!user || user.identity_provider || !user.loginSource) {
      return;
    }

    user.identity_provider = String(user.loginSource).toLowerCase();
  }

  private getSiteRoles(tokenData: any): string[] {
    const rawRoles =
      tokenData?.site_roles ??
      tokenData?.profile?.site_roles ??
      tokenData?.user?.profile?.site_roles;

    if (Array.isArray(rawRoles)) {
      return rawRoles;
    }

    if (typeof rawRoles === 'string') {
      return [rawRoles];
    }

    return [];
  }
}
