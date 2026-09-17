import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Machine-readable error codes returned by the service disclosure mutation.
 * Distinct from GraphQL validation errors (BAD_USER_INPUT) and generic 5xx.
 */
export const SITE_DISCLOSURE_ERROR_CODES = {
  DUPLICATE_DATE_COMPLETED: 'DUPLICATE_DATE_COMPLETED',
} as const;

export type SiteDisclosureErrorCode =
  (typeof SITE_DISCLOSURE_ERROR_CODES)[keyof typeof SITE_DISCLOSURE_ERROR_CODES];

const POSTGRES_UNIQUE_VIOLATION = '23505';
const SITE_PROFILES_UNIQUE_INDEX = 'site_profiles_pkey';

/**
 * Thrown by the disclosure add path when the unique (site_id, date_completed)
 * index is violated. Kept distinct from generic failures so callers can surface
 * a re-push conflict rather than a generic error.
 */
export class SiteDisclosureDuplicateException extends HttpException {
  constructor() {
    super(
      'A site disclosure already exists for this site and date completed.',
      HttpStatus.CONFLICT,
    );
  }
}

export function isSiteDisclosureDuplicateViolation(error: unknown): boolean {
  const dbError = error as
    | { code?: string; constraint?: string }
    | undefined;
  if (dbError?.code !== POSTGRES_UNIQUE_VIOLATION) {
    return false;
  }
  return (
    !dbError.constraint || dbError.constraint === SITE_PROFILES_UNIQUE_INDEX
  );
}
