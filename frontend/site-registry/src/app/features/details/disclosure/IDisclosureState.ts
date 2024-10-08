import { RequestStatus } from '../../../helpers/requests/status';

export interface IDisclosureState {
  siteDisclosure: {};
  error?: string;
  status: RequestStatus;
}
