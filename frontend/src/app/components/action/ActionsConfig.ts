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
  {
    label: 'Delete',
    value: SiteDetailsMode.ViewOnlyMode,
  },
];

export const getActionItems = (
  inlcudeSRApprovalOptions: boolean,
): DropdownItem[] => {
  if (inlcudeSRApprovalOptions) {
    return [
      ...ActionItems,
      {
        label: 'Public All Changes',
        value: SiteActionBtn.ApproveAll,
      },
      {
        label: 'Private All Changes',
        value: SiteActionBtn.RejectAll,
      },
    ];
  } else {
    return ActionItems;
  }
};
