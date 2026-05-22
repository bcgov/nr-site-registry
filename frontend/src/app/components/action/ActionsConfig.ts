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
  canDownloadPdf: boolean = false,
): DropdownItem[] => {
  let items = [...ActionItems];

  if (canDownloadPdf) {
    items.push({
      label: 'Download PDF',
      value: SiteActionBtn.DOWNLOAD_PDF,
    });
  }

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
        label: 'Make Changes Public',
        value: SiteActionBtn.ApproveAll,
      },
      {
        label: 'Make Changes Private',
        value: SiteActionBtn.RejectAll,
      },
    );
  }

  return items;
};
