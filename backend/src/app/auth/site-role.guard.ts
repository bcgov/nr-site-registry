import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { RoleMatchingMode } from 'nest-keycloak-connect';
import { SITE_ROLES_KEY, SiteRolesOptions } from './site-roles.decorator';

// This replaces the nest-keycloak-connect @Roles guard with a custom
// implementation for site roles.
@Injectable()
export class SiteRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

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
    if (request?.user) {
      this.normalizeUserClaims(request.user);
      return request.user;
    }

    const token = request?.headers?.authorization?.split(' ')[1];
    if (!token || token === 'undefined' || token.trim() === '') {
      return undefined;
    }

    const decodedToken = this.jwtService.decode(token);
    this.normalizeUserClaims(decodedToken);
    return decodedToken;
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