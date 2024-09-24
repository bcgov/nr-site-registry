import { DropdownItem } from '../../../components/action/IActions';
import Associate from '../associates/Associate';
import Disclosure from '../disclosure/Disclosure';
import Documents from '../documents/Documents';
import LandUses from '../landUses/LandUses';
import Notations from '../notations/Notations';
import ParcelDescriptions from '../parcelDescriptions/parcelDescriptions';
import Participants from '../participants/Participant';

import Summary from '../summary/Summary';

export const navItems: string[] = [
  'Summary',
  'Notations',
  'Site Participants',
  'Documents',
  'Associated Sites',
  'Suspect Land Uses',
  'Parcel Description',
  'Site Disclosure',
];

export const navComponents: JSX.Element[] = [
  <Summary />,
  <Notations />,
  <Participants />,
  <Documents />,
  <Associate />,
  <LandUses />,
  <ParcelDescriptions />,
  <Disclosure />,
];

export const dropDownNavItems: DropdownItem[] = [
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
