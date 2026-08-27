import { handleSigninCallback, signInWithReturnUrl } from './returnUrl';

describe('sign-in with return URL', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('stores the current address before redirecting to the identity provider', () => {
    const signinRedirect = jest.fn();

    signInWithReturnUrl({ signinRedirect });

    expect(sessionStorage.getItem('returnUrl')).toBe(window.location.href);
    expect(signinRedirect).toHaveBeenCalledWith({
      extraQueryParams: { kc_idp_hint: 'bceid' },
    });
  });

  it('uses a different identity provider when one is given', () => {
    const signinRedirect = jest.fn();

    signInWithReturnUrl({ signinRedirect }, { kc_idp_hint: 'idir' });

    expect(signinRedirect).toHaveBeenCalledWith({
      extraQueryParams: { kc_idp_hint: 'idir' },
    });
  });

  it('consumes the stored address after the OIDC callback and clears it', () => {
    const returnUrl = 'http://localhost/search';
    sessionStorage.setItem('returnUrl', returnUrl);
    const replace = jest.fn();
    const replaceState = jest.spyOn(window.history, 'replaceState');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'http://localhost/?code=abc&state=xyz&session_state=s&iss=https://idp',
        origin: 'http://localhost',
        pathname: '/',
        search: '?code=abc&state=xyz&session_state=s&iss=https://idp',
        hash: '',
        replace,
      },
    });

    handleSigninCallback();

    expect(replaceState).toHaveBeenCalledWith({}, expect.any(String), '/');
    expect(replace).toHaveBeenCalledWith(returnUrl);
    expect(sessionStorage.getItem('returnUrl')).toBeNull();

    replaceState.mockRestore();
  });

  it('strips OIDC callback parameters even when no address was stored', () => {
    const replace = jest.fn();
    const replaceState = jest.spyOn(window.history, 'replaceState');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'http://localhost/?code=abc&state=xyz',
        origin: 'http://localhost',
        pathname: '/',
        search: '?code=abc&state=xyz',
        hash: '',
        replace,
      },
    });

    handleSigninCallback();

    expect(replaceState).toHaveBeenCalledWith({}, expect.any(String), '/');
    expect(replace).not.toHaveBeenCalled();

    replaceState.mockRestore();
  });
});
