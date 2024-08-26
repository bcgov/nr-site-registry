export const CustomRoles = {
    External: process.env.ROLES_EXTERNAL ?? 'site-external-user',
    Internal: process.env.ROLES_INTERNAL ?? 'site-internal-user',
    SiteRegistrar: process.env.ROLES_SITE_REGISTRAR ?? 'site-site-registrar',
  };