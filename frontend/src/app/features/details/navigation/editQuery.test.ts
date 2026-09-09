import { UserType } from '../../../helpers/requests/userType';
import {
  decideEditQueryAction,
  hasEditParam,
  hasPendingEnterEdit,
  markPendingEnterEdit,
  resetEditQueryState,
  stripEditParam,
  clearPendingEnterEdit,
} from './editQuery';

describe('edit query helpers', () => {
  describe('hasEditParam', () => {
    it('treats any presence of edit as true', () => {
      expect(hasEditParam('?edit')).toBe(true);
      expect(hasEditParam('edit')).toBe(true);
      expect(hasEditParam('?edit=true')).toBe(true);
      expect(hasEditParam('?edit=1')).toBe(true);
      expect(hasEditParam('?edit=false')).toBe(true);
      expect(hasEditParam('?applicationId=abc&edit=true')).toBe(true);
    });

    it('is false when edit is absent', () => {
      expect(hasEditParam('')).toBe(false);
      expect(hasEditParam('?applicationId=abc')).toBe(false);
    });
  });

  describe('stripEditParam', () => {
    it('drops the edit key and keeps other params', () => {
      expect(stripEditParam('?edit')).toBe('');
      expect(stripEditParam('?edit=true')).toBe('');
      expect(stripEditParam('?applicationId=abc&edit')).toBe(
        '?applicationId=abc',
      );
      expect(stripEditParam('?edit&applicationId=abc')).toBe(
        '?applicationId=abc',
      );
    });

    it('leaves a search string without edit unchanged besides formatting', () => {
      expect(stripEditParam('?applicationId=abc')).toBe('?applicationId=abc');
      expect(stripEditParam('')).toBe('');
    });
  });

  describe('decideEditQueryAction', () => {
    it('no-ops until the user type is known', () => {
      expect(
        decideEditQueryAction({
          userType: null,
          hasSiteId: true,
        }),
      ).toEqual({ action: 'noop' });
    });

    it('strips without entering edit for external users', () => {
      expect(
        decideEditQueryAction({
          userType: UserType.External,
          hasSiteId: true,
        }),
      ).toEqual({ action: 'strip' });
    });

    it('strips without entering edit on create-site (no id)', () => {
      expect(
        decideEditQueryAction({
          userType: UserType.Internal,
          hasSiteId: false,
        }),
      ).toEqual({ action: 'strip' });
    });

    it('enters edit for Internal users with a site id, on any tab', () => {
      expect(
        decideEditQueryAction({
          userType: UserType.Internal,
          hasSiteId: true,
        }),
      ).toEqual({ action: 'enterEdit' });
    });
  });

  describe('pending enter-edit path', () => {
    beforeEach(() => {
      resetEditQueryState();
    });

    it('remembers a pending enter-edit path across a stripped URL', () => {
      expect(hasPendingEnterEdit('/site/details/9/notations')).toBe(false);
      markPendingEnterEdit('/site/details/9/notations');
      expect(hasPendingEnterEdit('/site/details/9/notations')).toBe(true);
      expect(hasPendingEnterEdit('/site/details/9/summary')).toBe(false);
      clearPendingEnterEdit();
      expect(hasPendingEnterEdit('/site/details/9/notations')).toBe(false);
    });
  });
});
