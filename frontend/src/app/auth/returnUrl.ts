const RETURN_URL_KEY = 'returnUrl';

type SignInRedirect = (args?: {
  extraQueryParams?: Record<string, string>;
}) => unknown;

export function signInWithReturnUrl(
  auth: { signinRedirect: SignInRedirect },
  extraQueryParams: Record<string, string> = { kc_idp_hint: 'bceid' },
): void {
  sessionStorage.setItem(RETURN_URL_KEY, window.location.href);
  auth.signinRedirect({ extraQueryParams });
}

export function handleSigninCallback(): void {
  window.history.replaceState({}, document.title, window.location.pathname);

  const returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
  sessionStorage.removeItem(RETURN_URL_KEY);
  if (returnUrl) {
    window.location.replace(returnUrl);
  }
}
