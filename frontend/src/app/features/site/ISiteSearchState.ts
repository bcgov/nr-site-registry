import { SiteResultDto } from './dto/Site';

export interface ISiteSearchState {
  sites: SiteResultDto[];
  searchParam: string;
  page: number;
  pageSize: number;
  count: number;
  filter: {};
  error: string;
  status: string;
}
