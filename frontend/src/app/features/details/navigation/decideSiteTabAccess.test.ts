import { decideSiteTabAccess, SiteTabAccessInput } from './decideSiteTabAccess';

const entitled: SiteTabAccessInput = {
  tab: 'notations',
  isAuthLoading: false,
  isAuthenticated: true,
  isSnapshotLoading: false,
  isClient: false,
  hasPurchasedSnapshot: false,
  showUpdatesTab: false,
};

describe('decideSiteTabAccess', () => {
  it('mounts Summary with no session', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'summary',
        isAuthenticated: false,
      }),
    ).toBe('mount');
  });

  it('shows sign-in for unauthenticated notations and does not mount the tab', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'notations',
        isAuthenticated: false,
      }),
    ).toBe('signIn');
  });

  it('shows the purchase prompt for an unpurchased Client', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'notations',
        isClient: true,
        hasPurchasedSnapshot: false,
      }),
    ).toBe('purchase');
  });

  it('does not show a purchase prompt for Internal users', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'notations',
        isClient: false,
        hasPurchasedSnapshot: false,
      }),
    ).toBe('mount');
  });

  it('shows sign-in for unauthenticated Updates', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'updates',
        isAuthenticated: false,
        showUpdatesTab: false,
      }),
    ).toBe('signIn');
  });

  it('redirects a non–Site Registrar away from Updates to Summary', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'updates',
        showUpdatesTab: false,
      }),
    ).toBe('redirectToSummary');
  });

  it('mounts Updates for an allowed Site Registrar', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'updates',
        showUpdatesTab: true,
      }),
    ).toBe('mount');
  });

  it('renders no tab body while auth is loading', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'notations',
        isAuthLoading: true,
      }),
    ).toBe('wait');
  });

  it('renders no tab body while an unpurchased Client snapshot is loading', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'notations',
        isClient: true,
        isSnapshotLoading: true,
        hasPurchasedSnapshot: false,
      }),
    ).toBe('wait');
  });

  it('mounts the current gated tab after a Client has purchased a snapshot', () => {
    expect(
      decideSiteTabAccess({
        ...entitled,
        tab: 'notations',
        isClient: true,
        hasPurchasedSnapshot: true,
      }),
    ).toBe('mount');
  });
});
