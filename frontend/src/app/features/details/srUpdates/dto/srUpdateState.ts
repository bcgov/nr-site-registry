import { RequestStatus } from '../../../../helpers/requests/status';

export class SRReviewListState {
  sites: SitePendingApprovalDTO[] = [];
  error: string = '';
  fetchStatus: string = RequestStatus.idle;
  updateStatus: string = RequestStatus.idle;
  searchQuery: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  resultsCount: number = 0;
  searchParam: any = null;
}

export class SitePendingApprovalDTO {
  siteId: string = '';
  changes: string = '';
  whoUpdated: string = '';
  whenUpdated: Date = new Date();
  address: string = '';
}

export class BulkApproveRejectChangesDTO {
  isApproved: boolean = false;
  sites: SitePendingApprovalDTO[] = [];
}
