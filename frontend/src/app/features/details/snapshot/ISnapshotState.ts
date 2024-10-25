import { RequestStatus } from '../../../helpers/requests/status';

export interface ISnapshotState {
  snapshot: [];
  error?: string;
  status: RequestStatus;
  createSnapshotRequest: RequestStatus;
  firstSnapshotCreatedDate: string | null;
  bannerType: string;
}

export interface CreateSnapshotInputDto {
  siteId: string;
}
