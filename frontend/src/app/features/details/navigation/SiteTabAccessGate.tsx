import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from 'react-oidc-context';

import { isUserOfType, UserRoleType } from '../../../helpers/utility';
import { RequestStatus } from '../../../helpers/requests/status';
import { siteDetailsMode } from '../../site/dto/SiteSlice';
import { hasUserPurchasedSnapshot, snapshots } from '../snapshot/SnapshotSlice';
import { hasNoPendingUpdates } from '../srUpdates/srUpdatesSlice';
import { decideSiteTabAccess } from './decideSiteTabAccess';
import GatedTabSignInPrompt from './GatedTabSignInPrompt';
import PurchaseAccessPrompt from './PurchaseAccessPrompt';
import {
  DEFAULT_SITE_TAB,
  shouldShowUpdatesTab,
  SiteTabPath,
} from './siteTabCatalog';

type SiteTabAccessGateProps = {
  tab: SiteTabPath;
  children: ReactNode;
};

const SiteTabAccessGate = ({ tab, children }: SiteTabAccessGateProps) => {
  const auth = useAuth();
  const location = useLocation();
  const snapshotState = useSelector(snapshots);
  const hasPurchasedSnapshot = useSelector(hasUserPurchasedSnapshot);
  const hasNoPendingUpdatesFromState = useSelector(hasNoPendingUpdates);
  const mode = useSelector(siteDetailsMode);

  const snapshotStatus = snapshotState?.status;
  const isSnapshotLoading =
    snapshotStatus === RequestStatus.idle ||
    snapshotStatus === RequestStatus.loading ||
    snapshotStatus === RequestStatus.pending;

  const decision = decideSiteTabAccess({
    tab,
    isAuthLoading: Boolean(auth?.isLoading),
    isAuthenticated: auth?.user != null,
    isSnapshotLoading,
    isClient: Boolean(isUserOfType(UserRoleType.CLIENT)),
    hasPurchasedSnapshot: Boolean(hasPurchasedSnapshot),
    showUpdatesTab: shouldShowUpdatesTab({
      hasPendingUpdates: !hasNoPendingUpdatesFromState,
      mode,
    }),
  });

  if (decision === 'wait') {
    return null;
  }

  if (decision === 'signIn') {
    return <GatedTabSignInPrompt />;
  }

  if (decision === 'purchase') {
    return <PurchaseAccessPrompt />;
  }

  if (decision === 'redirectToSummary') {
    return (
      <Navigate
        to={{
          pathname: `../${DEFAULT_SITE_TAB}`,
          search: location.search,
        }}
        replace
        relative="path"
      />
    );
  }

  return <>{children}</>;
};

export default SiteTabAccessGate;
