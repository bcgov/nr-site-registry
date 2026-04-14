import { RequestStatus } from '../../../helpers/requests/status';
import { IDisclosure } from './IDisclosure';

export interface IDisclosureState {
  siteDisclosure: {};
  error?: string;
  status: RequestStatus;
}
