import { isUserOfType, UserRoleType } from '../../../helpers/utility';
import {
  DEFAULT_SITE_TAB,
  getLegacyTabFlag,
  getSiteTabCatalog,
  getSiteTabFromPathname,
  isSiteTabPath,
} from './siteTabCatalog';

jest.mock('../../../helpers/utility', () => {
  const actual = jest.requireActual('../../../helpers/utility');
  return {
    ...actual,
    isUserOfType: jest.fn(),
  };
});

const mockedIsUserOfType = isUserOfType as jest.MockedFunction<
  typeof isUserOfType
>;

describe('site tab catalog', () => {
  beforeEach(() => {
    mockedIsUserOfType.mockReset();
    mockedIsUserOfType.mockReturnValue(false);
  });

  it('defaults to Summary', () => {
    expect(DEFAULT_SITE_TAB).toBe('summary');
  });

  it('recognizes known tab path segments', () => {
    expect(isSiteTabPath('summary')).toBe(true);
    expect(isSiteTabPath('notations')).toBe(true);
    expect(isSiteTabPath('updates')).toBe(true);
    expect(isSiteTabPath('unknown')).toBe(false);
    expect(isSiteTabPath(undefined)).toBe(false);
  });

  it('reads the active tab from the last path segment', () => {
    expect(getSiteTabFromPathname('/site/details/9/notations')).toBe(
      'notations',
    );
    expect(getSiteTabFromPathname('/search/site/details/9/summary')).toBe(
      'summary',
    );
    expect(getSiteTabFromPathname('/dashboard/site/create/documents')).toBe(
      'documents',
    );
    expect(getSiteTabFromPathname('/site/details/9')).toBeUndefined();
    expect(getSiteTabFromPathname('/site/details/9/unknown')).toBeUndefined();
  });

  it('hides Updates for everyone who is not a Site Registrar', () => {
    mockedIsUserOfType.mockReturnValue(false);

    const tabs = getSiteTabCatalog(true);

    expect(tabs.map((tab) => tab.value)).not.toContain('updates');
    expect(tabs[0].value).toBe('summary');
  });

  it('hides Updates in edit mode even for a Site Registrar', () => {
    mockedIsUserOfType.mockImplementation((role) => role === UserRoleType.SR);

    const tabs = getSiteTabCatalog(false);

    expect(tabs.map((tab) => tab.value)).not.toContain('updates');
    expect(tabs[0].value).toBe('summary');
  });

  it('prepends Updates only for a Site Registrar when requested', () => {
    mockedIsUserOfType.mockImplementation((role) => role === UserRoleType.SR);

    const tabs = getSiteTabCatalog(true);

    expect(tabs[0]).toEqual({ label: 'Updates', value: 'updates' });
    expect(tabs.map((tab) => tab.value)).toEqual([
      'updates',
      'summary',
      'notations',
      'participants',
      'documents',
      'associated',
      'landuses',
      'parceldesc',
      'disclosure',
    ]);
  });

  it('treats a known empty query flag as a legacy tab', () => {
    expect(getLegacyTabFlag(new URLSearchParams('notations'))).toBe(
      'notations',
    );
    expect(
      getLegacyTabFlag(new URLSearchParams('notations=1')),
    ).toBeUndefined();
    expect(
      getLegacyTabFlag(new URLSearchParams('applicationId=abc')),
    ).toBeUndefined();
  });
});
