import { SiteTabPath } from './siteTabCatalog';

export type SiteTabAccessDecision =
  | 'wait'
  | 'mount'
  | 'signIn'
  | 'purchase'
  | 'redirectToSummary';

export type SiteTabAccessInput = {
  tab: SiteTabPath;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isSnapshotLoading: boolean;
  isClient: boolean;
  hasPurchasedSnapshot: boolean;
  showUpdatesTab: boolean;
};

export function decideSiteTabAccess(
  input: SiteTabAccessInput,
): SiteTabAccessDecision {
  if (input.isAuthLoading) {
    return 'wait';
  }

  if (input.tab === 'summary') {
    return 'mount';
  }

  if (!input.isAuthenticated) {
    return 'signIn';
  }

  if (input.tab === 'updates' && !input.showUpdatesTab) {
    return 'redirectToSummary';
  }

  if (
    input.isClient &&
    input.isSnapshotLoading &&
    !input.hasPurchasedSnapshot
  ) {
    return 'wait';
  }

  if (input.isClient && !input.hasPurchasedSnapshot) {
    return 'purchase';
  }

  return 'mount';
}
