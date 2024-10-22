import { RequestStatus } from '../../../helpers/requests/status';

export interface IDocumentsState {
  siteDocuments: [];
  error?: string;
  status: RequestStatus;
}
