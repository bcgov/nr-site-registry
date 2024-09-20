import { RequestStatus } from '../../../helpers/requests/status';

interface IDropdowns {
  participantNames: [];
  participantRoles: [];
  notationClass: [];
  notationParticipantRole: [];
  notationType: [];
  ministryContact: [];
}

export interface IDropdownsState {
  dropdowns: IDropdowns;
  error?: string;
  status: RequestStatus;
}
