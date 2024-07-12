import { RequestStatus } from '../../../helpers/requests/status';

interface IDropdowns {
  participantNames: [];
  participantRoles: [];
}

export interface IDropdownsState {
  dropdowns: IDropdowns;
  error?: string;
  status: string;
}
