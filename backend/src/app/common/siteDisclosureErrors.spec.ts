import {
  SiteDisclosureDuplicateException,
  isSiteDisclosureDuplicateViolation,
} from './siteDisclosureErrors';

describe('siteDisclosureErrors', () => {
  describe('isSiteDisclosureDuplicateViolation', () => {
    it('detects the site_profiles unique index violation', () => {
      expect(
        isSiteDisclosureDuplicateViolation({
          code: '23505',
          constraint: 'site_profiles_pkey',
        }),
      ).toBe(true);
    });

    it('detects a unique violation without a constraint name', () => {
      expect(isSiteDisclosureDuplicateViolation({ code: '23505' })).toBe(true);
    });

    it('ignores other unique violations such as land uses', () => {
      expect(
        isSiteDisclosureDuplicateViolation({
          code: '23505',
          constraint: 'site_profile_land_uses_pkey',
        }),
      ).toBe(false);
    });

    it('ignores non-unique errors', () => {
      expect(isSiteDisclosureDuplicateViolation(new Error('boom'))).toBe(false);
      expect(isSiteDisclosureDuplicateViolation(undefined)).toBe(false);
    });
  });

  describe('SiteDisclosureDuplicateException', () => {
    it('is a 409 conflict', () => {
      const exception = new SiteDisclosureDuplicateException();
      expect(exception.getStatus()).toBe(409);
    });
  });
});
