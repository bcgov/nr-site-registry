import { SiteSortBy, SortByDirection } from '../../../graphql/generated';
import { SiteResultDto } from './dto/Site';

export interface ISiteSearchState {
  sites: SiteResultDto[];
  searchParam: string;
  page: number;
  pageSize: number;
  count: number;
  sortBy: SiteSortBy;
  sortByDir: SortByDirection;
  filter: {};
  error: string;
  status: string;
}
