import { RequestStatus } from '../../../helpers/requests/status';

export interface INotationState {
  siteNotation: [];
  error?: string;
  status: RequestStatus;
}
