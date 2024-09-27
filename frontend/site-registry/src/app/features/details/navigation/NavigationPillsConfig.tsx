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

const mainNavItems = [
  'Summary',
  'Notations',
  'Site Participants',
  'Documents',
  'Associated Sites',
  'Suspect Land Uses',
  'Parcel Description',
  'Site Disclosure',
];


export interface IComponentProps
{
  showPending?: boolean;
}




export const getNavItems= () =>  isUserOfType(UserRoleType.SR)? ['Updates',...mainNavItems] : mainNavItems;

const mainNavComponents = [
  <Summary />,
  <Notations />,
  <Participants />,
  <Documents />,
  <Associate />,
  <LandUses />,
  <ParcelDescriptions />,
  <Disclosure />,
];

export const getNavComponents= () => isUserOfType(UserRoleType.SR)? [ <SRUpdates/> , ...mainNavComponents] : mainNavComponents;

export const mainDropDownNavItems = [
  {
    label: 'Summary',
    value: 'Summary',
  },
  {
    label: 'Notations',
    value: 'Notations',
  },
  {
    label: 'Site Participants',
    value: 'Site Participants',
  },
  {
    label: 'Documents',
    value: 'Documents',
  },
  {
    label: 'Associated Sites',
    value: 'Associated Sites',
  },
  {
    label: 'Suspect Land Uses',
    value: 'Suspect Land Uses',
  },
  {
    label: 'Parcel Description',
    value: 'Parcel Description',
  },
  {
    label: 'Site Disclosure',
    value: 'Site Disclosure',
  },
];



export const getDropDownNavItems= () => isUserOfType(UserRoleType.SR)? [ {
  label: 'Updated',
  value: 'SRUpdates',
} , ...mainDropDownNavItems] : mainDropDownNavItems;
