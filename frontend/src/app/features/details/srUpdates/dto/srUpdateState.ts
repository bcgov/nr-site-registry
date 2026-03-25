import { RequestStatus } from '../../../../helpers/requests/status';
import { SiteSortBy, SortByDirection } from '../../../../../graphql/generated';

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
  sortBy: SiteSortBy = SiteSortBy.Id;
  sortByDir: SortByDirection = SortByDirection.Asc;
}

export class SitePendingApprovalDTO {
  siteId: string = '';
  changes: string = '';
  whoUpdated: string = '';
  whenUpdated: Date = new Date();
  address: string = '';
  id: string = '';
}

export class BulkApproveRejectChangesDTO {
  isApproved: boolean = false;
  fromSiteDetails: boolean = false;
  sites: SitePendingApprovalDTO[] = [];
}
