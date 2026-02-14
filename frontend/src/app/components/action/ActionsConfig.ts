import {
  SiteActionBtn,
  SiteDetailsMode,
} from '../../features/details/dto/SiteDetailsMode';
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
];

export const getActionItems = (
  includeSRApprovalOptions: boolean,
  isSRUser: boolean = false,
): DropdownItem[] => {
  let items = [...ActionItems];

  // Add Delete Site option only for SR users
  if (isSRUser) {
    items.push({
      label: 'Delete Site',
      value: SiteActionBtn.DELETE_SITE,
      danger: true,
    });
  }

  // Add SR approval actions if needed
  if (includeSRApprovalOptions) {
    items.push(
      {
        label: 'Approve All Changes',
        value: SiteActionBtn.ApproveAll,
      },
      {
        label: 'Not Public',
        value: SiteActionBtn.RejectAll,
      },
    );
  }

  return items;
};
