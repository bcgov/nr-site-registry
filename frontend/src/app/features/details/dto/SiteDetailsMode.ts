import { RequestStatus } from '../../../helpers/requests/status';

export enum SiteDetailsMode {
  EditMode = 'edit',
  SRMode = 'sr',
  ViewOnlyMode = 'normal',
}

export enum SiteActionBtn {
  ApproveAll = 'approve_all',
  RejectAll = 'reject_all',
  SAVE = 'save',
  CANCEL = 'cancel',
}

export interface SaveSiteDetails {
  saveRequestStatus: RequestStatus;
  parentBucket: any;
  notationData: any;
  siteParticipantData: any;
  siteAssociationsData: any;
  parcelDescriptionsData: any;
  landHistoriesData: any;
  documentsData: any;
  profilesData: any;
  siteId: string;
  sitesSummary: any;
}
