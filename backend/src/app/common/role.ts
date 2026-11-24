export const CustomRoles = {
  External: process.env.ROLES_EXTERNAL ?? 'site-external-user',
  Internal: process.env.ROLES_INTERNAL ?? 'site-internal-user',
  SiteRegistrar: process.env.ROLES_SITE_REGISTRAR ?? 'site-registrar',
  ServiceCaller: process.env.ROLES_SERVICE_CALLER ?? 'site-service-caller',
};

/**
 * nest-keycloak-connect treats unprefixed names as client roles.
 * Realm roles (e.g. service-account realm role mappings) must be
 * matched as `realm:<name>` as well.
 */
export function keycloakRoleAliases(role: string): string[] {
  const unprefixed = role.replace(/^realm:/, '');
  return [...new Set([unprefixed, `realm:${unprefixed}`])];
}
