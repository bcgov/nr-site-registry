import { RequestStatus } from '../../../helpers/requests/status';

interface IDropdowns {
  participantNames: [];
  participantRoles: [];
  notationClass: [];
  notationParticipantRole: [];
  notationType: [];
  ministryContact: [];
  internalUserList: [];
  siteRiskCode: [];
  bceRegionCode?: [];
  siteStatusCode?: [];
}

export interface IDropdownsState {
  dropdowns: IDropdowns;
  error?: string;
  status: RequestStatus;
}
