import { ForbiddenException } from '@nestjs/common';
import {
  assertAllowedServiceClient,
  getAllowedServiceClientIds,
} from './serviceClientAllowlist';

describe('serviceClientAllowlist', () => {
  const original = process.env.SITE_SERVICE_ALLOWED_CLIENT_IDS;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.SITE_SERVICE_ALLOWED_CLIENT_IDS;
    } else {
      process.env.SITE_SERVICE_ALLOWED_CLIENT_IDS = original;
    }
  });

  describe('getAllowedServiceClientIds', () => {
    it('defaults to site-service', () => {
      delete process.env.SITE_SERVICE_ALLOWED_CLIENT_IDS;
      expect(getAllowedServiceClientIds()).toEqual(['site-service']);
    });

    it('parses a comma-separated allowlist', () => {
      process.env.SITE_SERVICE_ALLOWED_CLIENT_IDS = 'site-service, cats-service';
      expect(getAllowedServiceClientIds()).toEqual([
        'site-service',
        'cats-service',
      ]);
    });
  });

  describe('assertAllowedServiceClient', () => {
    it('allows a matching azp', () => {
      expect(() =>
        assertAllowedServiceClient({ azp: 'site-service' }),
      ).not.toThrow();
    });

    it('rejects a missing token payload', () => {
      expect(() => assertAllowedServiceClient(null)).toThrow(
        ForbiddenException,
      );
    });

    it('rejects a user token from another client', () => {
      expect(() =>
        assertAllowedServiceClient({ azp: 'site-web' }),
      ).toThrow(ForbiddenException);
    });
  });
});
