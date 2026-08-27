import { ComponentType } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

import Associate from '../associates/Associate';
import Disclosure from '../disclosure/Disclosure';
import Documents from '../documents/Documents';
import LandUses from '../landUses/LandUses';
import Notations from '../notations/Notations';
import ParcelDescriptions from '../parcelDescriptions/parcelDescriptions';
import Participants from '../participants/Participant';
import SRUpdates from '../srUpdates/srUpdates';
import Summary from '../summary/Summary';
import { DEFAULT_SITE_TAB, isSiteTabPath, SiteTabPath } from './siteTabCatalog';

const SITE_TAB_VIEWS: Record<SiteTabPath, ComponentType> = {
  summary: Summary,
  notations: Notations,
  participants: Participants,
  documents: Documents,
  associated: Associate,
  landuses: LandUses,
  parceldesc: ParcelDescriptions,
  disclosure: Disclosure,
  updates: SRUpdates,
};

const SiteDetailsTabRouter = () => {
  const { tab } = useParams();
  const location = useLocation();

  if (!isSiteTabPath(tab)) {
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

  const TabView = SITE_TAB_VIEWS[tab];
  return <TabView />;
};

export default SiteDetailsTabRouter;
