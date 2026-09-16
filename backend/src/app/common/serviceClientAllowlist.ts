import { ForbiddenException } from '@nestjs/common';

export function getAllowedServiceClientIds(): string[] {
  const raw = process.env.SITE_SERVICE_ALLOWED_CLIENT_IDS ?? 'site-service';
  return raw
    .split(',')
    .map((clientId) => clientId.trim())
    .filter(Boolean);
}

export function assertAllowedServiceClient(
  userInfo: { azp?: string } | null | undefined,
): void {
  const azp = userInfo?.azp;
  const allowed = getAllowedServiceClientIds();
  if (!azp || !allowed.includes(azp)) {
    throw new ForbiddenException(
      `Client '${azp ?? 'unknown'}' is not allowed to call this service query`,
    );
  }
}
