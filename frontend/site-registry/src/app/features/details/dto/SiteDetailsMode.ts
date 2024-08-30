import { RequestStatus } from '../../../helpers/requests/status';

export enum SiteDetailsMode {
  EditMode = 'edit',
  SRMode = 'sr',
  ViewOnlyMode = 'normal',
}

export interface SaveSiteDetails {
  saveRequestStatus: RequestStatus;
  notationData: any;
  siteParticipantData: any;
  siteAssociationsData: any;
  subDivisionsData: any;
  landHistoriesData: any;
  documentsData: any;
  profilesData: any;
  siteId: string;
}
