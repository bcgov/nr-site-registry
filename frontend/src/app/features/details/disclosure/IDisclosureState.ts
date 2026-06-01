import { RequestStatus } from '../../../helpers/requests/status';

export interface IDisclosureState {
  siteDisclosure: any[];
  error?: string;
  status: RequestStatus;
}
