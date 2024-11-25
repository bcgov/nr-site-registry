import { isUserOfType, UserRoleType } from '../../../helpers/utility';
import Associate from '../associates/Associate';
import Disclosure from '../disclosure/Disclosure';
import Documents from '../documents/Documents';
import LandUses from '../landUses/LandUses';
import Notations from '../notations/Notations';
import ParcelDescriptions from '../parcelDescriptions/parcelDescriptions';
import Participants from '../participants/Participant';
import SRUpdates from '../srUpdates/srUpdates';

import Summary from '../summary/Summary';

export interface IComponentProps {
  showPending?: boolean;
}

const mainNavComponents = [
  { label: 'Summary', value: 'summary', component: <Summary /> },
  { label: 'Notations', value: 'notations', component: <Notations /> },
  {
    label: 'Site Participants',
    value: 'participants',
    component: <Participants />,
  },
  { label: 'Documents', value: 'documents', component: <Documents /> },
  { label: 'Associated Sites', value: 'associated', component: <Associate /> },
  { label: 'Suspect Land Uses', value: 'landuses', component: <LandUses /> },
  {
    label: 'Parcel Description',
    value: 'parceldesc',
    component: <ParcelDescriptions />,
  },
  { label: 'Site Disclosure', value: 'disclosure', component: <Disclosure /> },
];

export const getNavComponents = (includeUpdatesTab: boolean) =>
  isUserOfType(UserRoleType.SR) && includeUpdatesTab
    ? [
        { label: 'Updates', value: 'updates', component: <SRUpdates /> },
        ...mainNavComponents,
      ]
    : mainNavComponents;
