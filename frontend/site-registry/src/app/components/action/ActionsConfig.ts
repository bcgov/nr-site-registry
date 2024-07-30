import { SiteDetailsMode } from '../../features/details/dto/SiteDetailsMode';
import { DropdownItem } from './IActions';

export const ActionItems: DropdownItem[] = [
  {
    label: 'Edit Mode',
    value: SiteDetailsMode.EditMode,
  },
  {
    label: 'SR Mode',
    value: SiteDetailsMode.SRMode,
  },
  {
    label: 'Delete',
    value: SiteDetailsMode.ViewOnlyMode,
  },
];
